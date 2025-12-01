import { createSchema, createYoga } from "graphql-yoga";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import resolvers from "../../../graphql/resolvers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// 本地開發環境允許的 IP
const ALLOWED_IP_RANGES = [
  { ip: "127.0.0.1" },
  { ip: "::1" },
  { ip: "localhost" },
  { ip: "::ffff:127.0.0.1" },
];

function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  return '127.0.0.1';
}

function isIPAllowed(clientIP: string): boolean {
  // 開發環境默認允許本地 IP
  if (process.env.NODE_ENV === 'development') {
    if (clientIP.includes('127.0') || clientIP.includes('::1') || clientIP === 'localhost') {
      return true;
    }
  }

  for (const range of ALLOWED_IP_RANGES) {
    if (clientIP === range.ip) {
      return true;
    }
  }

  return false;
}

async function verifyToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "");
      return !!decoded;
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  }
  return false;
}

const withAuth = (resolvers: Record<string, unknown>) => {
  const wrappedResolvers = { ...resolvers };

  if ((resolvers as { Mutation?: Record<string, unknown> }).Mutation) {
    (wrappedResolvers as { Mutation: Record<string, unknown> }).Mutation = Object.keys((resolvers as { Mutation: Record<string, unknown> }).Mutation).reduce(
      (acc: Record<string, unknown>, key: string) => {
        acc[key] = async (parent: unknown, args: unknown, context: { isIPAllowed: boolean; isAuthenticated: boolean; clientIP: string }, info: unknown) => {
          if (!context.isIPAllowed) {
            throw new Error(
              `拒絕存取：您的 IP 地址 (${context.clientIP}) 沒有執行修改操作的權限。`
            );
          }

          if (!context.isAuthenticated) {
            throw new Error(
              "驗證失敗：需要有效的 Authorization Bearer Token 才能執行修改操作"
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
  async context({ request }) {
    let isAuthenticated = false;
    let isIPWhitelisted = false;
    let clientIP = "unknown";

    try {
      clientIP = getClientIP(request);
      isIPWhitelisted = isIPAllowed(clientIP);
      isAuthenticated = await verifyToken(request);
    } catch (error) {
      console.error("驗證錯誤:", error);
    }

    return {
      isAuthenticated,
      isIPAllowed: isIPWhitelisted,
      clientIP
    };
  },
});

export const GET = yoga;
export const POST = yoga;
export const OPTIONS = yoga;
