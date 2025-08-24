import { type DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

// Extend the built-in session types
declare module "next-auth" {
  interface Session extends DefaultSession {
    address: string;
    user: {
      /** The user's wallet address. */
      address: string;
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const nextAuthDomain =
            process.env.NEXTAUTH_URL ||
            process.env.VERCEL_URL ||
            process.env.VERCEL_BRANCH_URL ||
            "localhost:3000";

          console.log("nextAuthDomain", {
            nextAuthDomain,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            VERCEL_URL: process.env.VERCEL_URL,
            VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
          });

          const siwe = new SiweMessage(credentials.message);

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: nextAuthDomain,
            nonce: await getCsrfToken({ req }),
          });

          if (result.success) {
            return {
              id: siwe.address,
              address: siwe.address,
            };
          }

          return null;
        } catch (e) {
          console.error("SIWE Auth error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.address = (user as any).address;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.address = token.sub;
        session.user.address = token.sub;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "development-secret-please-change-in-production",
};
