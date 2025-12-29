"use client";

import AppLogo from "@/components/app/Logos/AppLogo";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Button = ({ className, variant = "primary", ...props }: any) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants: any = {
    primary:
      "bg-black text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
    outline:
      "border border-zinc-200 bg-transparent hover:bg-zinc-50 text-zinc-900",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

export default function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-200">
      {/* Hero Section */}
      <header className="pt-16 pb-16 md:pt-40 md:pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            {...fadeIn}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[1.05]"
          >
            Zakupy, <br />
            <span className="text-zinc-400">uproszczone.</span>
          </motion.h1>

          <motion.p
            {...fadeIn}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-zinc-500 mb-12 max-w-xl mx-auto leading-relaxed"
          >
            0 zł brutto to niewygórowana cena za taką apkę.
          </motion.p>

          <motion.div
            {...fadeIn}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/lists" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto text-lg gap-2 group">
                Moje listy zakupowe
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Footer */}
      <footer className="py-16 bg-white text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-lg mb-4">
          <div className="bg-zinc-100 p-1.5 rounded-lg">
            <AppLogo />
          </div>
          <span>Shopping</span>
        </div>
        <p className="text-zinc-400 text-sm">
          © 2025 Shopping. Skup się na zakupach.
        </p>
      </footer>
    </div>
  );
}
