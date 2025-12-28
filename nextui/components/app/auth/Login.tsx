"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import { LuLoader } from "react-icons/lu";

const Login = () => {
  const { status, data: session } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-2">
        <LuLoader className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">
          Witaj, {session?.user?.name || "Użytkowniku"}
        </span>
        <Button
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Wyloguj
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn("keycloak", { callbackUrl: "/" })}>
      Login
    </Button>
  );
};

export default Login;
