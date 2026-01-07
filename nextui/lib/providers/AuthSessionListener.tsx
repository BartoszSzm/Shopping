"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthSessionListener() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ redirect: false }).then(() => {
        const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;

        const logoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(
          window.location.origin
        )}`;

        window.location.href = logoutUrl;
      });
    }
  }, [session]);

  return null;
}
