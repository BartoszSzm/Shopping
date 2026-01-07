"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthManager() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signIn("keycloak");
    }
  }, [session]);

  return null;
}
