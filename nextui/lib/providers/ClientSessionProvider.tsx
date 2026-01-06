"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

const ClientSessionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider refetchInterval={10} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
};

export default ClientSessionProvider;
