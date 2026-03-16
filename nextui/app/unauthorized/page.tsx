"use client";

import AppLogo from "@/components/app/Logos/AppLogo";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function UnauthorizedPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      <motion.div
        {...fadeIn}
        className="w-full max-w-md bg-white p-12 rounded-[32px] shadow-sm border border-zinc-100 text-center"
      >
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="bg-red-50 p-4 rounded-2xl">
            <ShieldAlert className="w-8 h-8 text-red-500" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Brak dostępu
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed px-4">
              Twoje konto nie ma uprawnień do przeglądania tej sekcji lub nie
              znajduje się na liście dozwolonych użytkowników.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do strony głównej
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-zinc-600 border border-zinc-200 rounded-2xl font-medium hover:bg-zinc-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Zaloguj się na inne konto
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex flex-col items-center gap-4"
      >
        <AppLogo />
      </motion.div>
    </div>
  );
}
