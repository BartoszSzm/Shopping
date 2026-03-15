import "next-auth";

type ShoppingUser = {
  email: string;
  id: string;
};

declare module "next-auth" {
  interface Session {
    shoppingUser: ShoppingUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    email: string;
    accessToken?: string;
  }
}
