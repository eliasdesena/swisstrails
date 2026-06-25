import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "Swiss Trails <hello@swiss-trails.com>",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login/verify",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected =
        nextUrl.pathname.startsWith("/explore") ||
        nextUrl.pathname.startsWith("/favorites") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/admin");

      if (isProtected) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
