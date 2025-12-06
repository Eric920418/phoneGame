/**
 * GraphQL 客戶端
 * 使用原生 fetch API + 快取優化
 */

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

// 簡易內存快取（用於客戶端）
const queryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 秒快取過期時間

// 判斷是否為讀取操作（可快取）
function isReadOperation(query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  return trimmed.startsWith('query') ||
         (!trimmed.startsWith('mutation') && !trimmed.startsWith('subscription'));
}

// 生成快取鍵
function getCacheKey(query: string, variables?: Record<string, unknown>): string {
  return JSON.stringify({ query: query.trim(), variables });
}

export async function graphqlFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { skipCache?: boolean }
): Promise<T> {
  const url = typeof window === 'undefined'
    ? `http://localhost:${process.env.PORT || 3000}/api/graphql`
    : "/api/graphql";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 客戶端：從 localStorage 讀取 token
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // 客戶端快取邏輯（僅對讀取操作）
  const canUseCache = typeof window !== 'undefined' &&
                      isReadOperation(query) &&
                      !options?.skipCache;

  if (canUseCache) {
    const cacheKey = getCacheKey(query, variables);
    const cached = queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    // 對讀取操作使用瀏覽器快取，mutation 使用 no-store
    cache: isReadOperation(query) ? "default" : "no-store",
    // Next.js 重新驗證設定（伺服器端）
    next: typeof window === 'undefined' && isReadOperation(query)
      ? { revalidate: 60 } as RequestInit['next']
      : undefined,
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMessage = result.errors[0].message;
    console.error("GraphQL Error:", errorMessage);

    if (errorMessage.includes("Cannot read properties of undefined")) {
      throw new Error(
        "資料庫未配置或連接失敗！\n\n" +
        "請檢查：\n" +
        "1. PostgreSQL 是否已啟動\n" +
        "2. .env 文件中的 DATABASE_URL 是否正確\n" +
        "3. 是否已運行 'pnpm prisma migrate dev'\n\n" +
        "原始錯誤: " + errorMessage
      );
    }

    throw new Error(errorMessage);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  // 將結果存入快取（僅客戶端讀取操作）
  if (canUseCache) {
    const cacheKey = getCacheKey(query, variables);
    queryCache.set(cacheKey, { data: result.data, timestamp: Date.now() });

    // 清理過期快取（限制快取大小）
    if (queryCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of queryCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          queryCache.delete(key);
        }
      }
    }
  }

  return result.data;
}

// 手動清除快取（mutation 後使用）
export function invalidateCache(pattern?: string): void {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

export const getClient = () => ({
  query: async <T = unknown>({ query, variables }: { query: string | { loc?: { source: { body: string } } }; variables?: Record<string, unknown> }) => {
    const queryString = typeof query === "string" ? query : query.loc?.source?.body || "";
    const data = await graphqlFetch<T>(queryString, variables);
    return { data };
  },
  mutate: async <T = unknown>({ mutation, variables }: { mutation: string | { loc?: { source: { body: string } } }; variables?: Record<string, unknown> }) => {
    const mutationString = typeof mutation === "string" ? mutation : mutation.loc?.source?.body || "";
    const data = await graphqlFetch<T>(mutationString, variables);
    return { data };
  },
});
