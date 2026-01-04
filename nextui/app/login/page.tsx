"use client";

import AppLogo from "@/components/app/Logos/AppLogo";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      signIn("keycloak", { callbackUrl: "/" });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
      {/* @ts-ignore */}
      <motion.div
        {...fadeIn}
        className="w-full max-w-md bg-white p-12 rounded-[32px] shadow-sm border border-zinc-100 text-center"
      >
        {/* Logo i Ikona */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="bg-zinc-50 p-4 rounded-2xl">
            <AppLogo />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Logowanie
            </h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Zaraz zostaniesz przekierowany do bezpiecznego panelu logowania.
            </p>
          </div>
        </div>

        {/* Spinner i Status */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {/* Pulsacyjne tło pod spinnerem */}
            <div className="absolute inset-0 bg-zinc-100 rounded-full scale-150 blur-xl opacity-50" />
            <Loader2
              className="w-8 h-8 text-black animate-spin relative z-10"
              strokeWidth={2.5}
            />
          </div>

          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest mt-2">
            Pracujemy nad tym...
          </span>
        </div>
      </motion.div>

      {/* Dyskretny powrót */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-zinc-400 text-sm"
      >
        To nie powinno zająć więcej niż kilka sekund.
      </motion.p>
    </div>
  );
}
