import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Logika middleware
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      // Wskazujemy bezpośrednio endpoint logowania Keycloak
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/account/:path*"],
};
