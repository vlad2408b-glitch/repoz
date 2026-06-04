import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Конфиг NextAuth v4. Вход только через Google.
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // JWT-сессии - идеально для serverless на Vercel (без отдельной таблицы сессий).
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id ?? token.sub;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token.uid as string) ?? (token.sub as string);
      }
      return session;
    },
  },
};
