/**
 * GraphQL 客戶端
 * 使用原生 fetch API
 */

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = typeof window === 'undefined'
    ? `http://localhost:${process.env.PORT || 3000}/api/graphql`
    : "/api/graphql";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

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

  return result.data;
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
