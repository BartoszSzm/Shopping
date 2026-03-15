import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAllowedUser } from "./utils";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.email) return "/unauthorized";

      if (await getAllowedUser(user.email)) {
        return true;
      } else {
        return "/unauthorized";
      }
    },
    async jwt({ token, user, account, profile }) {
      // User just logged in
      if (account) {
        token.accessToken = account.access_token;
        token.email = user.email!;
      }
      return token;
    },

    async session({ session, token }) {
      const allowedUser = await getAllowedUser(token.email);
      if (allowedUser) session.shoppingUser = allowedUser;
      return session;
    },
  },
};
