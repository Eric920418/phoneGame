import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import jwt from "jsonwebtoken";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 從環境變數讀取管理員憑證
        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "1",
            name: credentials.username,
            email: "admin@kingdoms.com",
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 小時
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = jwt.sign(
          { userId: user.id },
          process.env.NEXTAUTH_SECRET || "",
          { expiresIn: "1d" }
        );
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
