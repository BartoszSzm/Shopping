"use client";

import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/auth/federated-logout")
      .then(async () => await signOut({ callbackUrl: "/" }))
      .catch((e) => {
        const error = e as Error;
        toast.error(`Nie można wylogować: ${error.message}`);
        console.error(error);
      });
  };

  return <button onClick={handleLogout}>Wyloguj się</button>;
}
