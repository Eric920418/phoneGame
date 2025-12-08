import { createSchema, createYoga } from "graphql-yoga";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import resolvers from "../../../graphql/resolvers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "../../../graphql/prismaClient";

const DB_QUERY_TIMEOUT = 5000; // 5 秒數據庫查詢超時

interface TokenPayload {
  userId?: number;
  accessToken?: string;
}

// 帶超時的 Promise 封裝
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('數據庫查詢超時')), timeoutMs)
    )
  ]);
}

async function verifyToken(request: Request): Promise<{ isValid: boolean; userId?: number; isAdmin?: boolean }> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "") as TokenPayload;
      if (decoded.userId) {
        // 添加超時控制防止數據庫查詢卡住
        const user = await withTimeout(
          prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { isAdmin: true }
          }),
          DB_QUERY_TIMEOUT
        );
        return { isValid: true, userId: decoded.userId, isAdmin: user?.isAdmin || false };
      }
      return { isValid: true, userId: decoded.userId, isAdmin: false };
    } catch (error) {
      console.error("Token verification failed:", error);
      return { isValid: false };
    }
  }
  return { isValid: false };
}

// 這些操作不需要管理員認證，只需要用戶登入或公開操作
const PUBLIC_MUTATIONS = [
  'register',
  'login',
  'createReview',
  'updateReview',
  'deleteReview',
  'createReviewReply',
  'deleteReviewReply',
  'likeReview',
  'unlikeReview',
  'reportReview',
  'updateProfile',
  'updateGameHours',
];

const withAuth = (resolvers: Record<string, unknown>) => {
  const wrappedResolvers = { ...resolvers };

  if ((resolvers as { Mutation?: Record<string, unknown> }).Mutation) {
    (wrappedResolvers as { Mutation: Record<string, unknown> }).Mutation = Object.keys((resolvers as { Mutation: Record<string, unknown> }).Mutation).reduce(
      (acc: Record<string, unknown>, key: string) => {
        acc[key] = async (parent: unknown, args: unknown, context: { isAuthenticated: boolean; isAdmin: boolean; userId?: number }, info: unknown) => {
          // 用戶相關操作不需要管理員認證
          if (PUBLIC_MUTATIONS.includes(key)) {
            // register 和 login 不需要任何認證
            if (key === 'register' || key === 'login') {
              return ((resolvers as { Mutation: Record<string, (parent: unknown, args: unknown, context: unknown, info: unknown) => unknown> }).Mutation)[key](parent, args, context, info);
            }
            // 其他用戶操作需要用戶 token（在 resolver 層面檢查）
            return ((resolvers as { Mutation: Record<string, (parent: unknown, args: unknown, context: unknown, info: unknown) => unknown> }).Mutation)[key](parent, args, context, info);
          }

          // 管理員操作需要認證且必須是管理員
          if (!context.isAuthenticated) {
            throw new Error(
              "驗證失敗：需要有效的 Authorization Bearer Token 才能執行修改操作"
            );
          }

          if (!context.isAdmin) {
            throw new Error(
              "權限不足：只有管理員才能執行此操作"
            );
          }

          return ((resolvers as { Mutation: Record<string, (parent: unknown, args: unknown, context: unknown, info: unknown) => unknown> }).Mutation)[key](parent, args, context, info);
        };
        return acc;
      },
      {}
    );
  }

  return wrappedResolvers;
};

const schemasDir = path.join(process.cwd(), "graphql/schemas");

const typeDefs = readdirSync(schemasDir)
  .filter((file: string) => file.endsWith(".graphql"))
  .map((file: string) => readFileSync(path.join(schemasDir, file), "utf-8"))
  .join("\n");

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers: withAuth(resolvers as Record<string, unknown>),
  }),
  graphqlEndpoint: "/api/graphql",
  fetchAPI: { Response: NextResponse },
  maskedErrors: false, // 顯示完整錯誤訊息
  async context({ request }) {
    let isAuthenticated = false;
    let isAdmin = false;
    let userId: number | undefined = undefined;

    try {
      const tokenResult = await verifyToken(request);
      isAuthenticated = tokenResult.isValid;
      isAdmin = tokenResult.isAdmin || false;
      userId = tokenResult.userId;
    } catch (error) {
      console.error("驗證錯誤:", error);
    }

    return {
      isAuthenticated,
      isAdmin,
      userId,
    };
  },
});

export const GET = yoga;
export const POST = yoga;
export const OPTIONS = yoga;
