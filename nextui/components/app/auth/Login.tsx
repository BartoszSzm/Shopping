"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LuLoader } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserLogo from "../Logos/UserLogo";

const Login = () => {
  const { status, data: session } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-2">
        <LuLoader className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Button onClick={() => signIn("keycloak", { callbackUrl: "/" })}>
        Zaloguj
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-all">
          <UserLogo />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || "Moje konto"}
            </p>
            {session?.user?.email && (
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:bg-red-50 cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Wyloguj się
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Login;
