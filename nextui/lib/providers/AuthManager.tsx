"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthManager() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    }
  }, [session]);

  return null;
}
