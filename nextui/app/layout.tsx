import Navbar from "@/components/app/navbar/Navbar";
import ClientSessionProvider from "@/lib/providers/ClientSessionProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shopping",
  description: "Simple shopping app by Bartosz Szmyt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div>
          <ClientSessionProvider>
            <Toaster position="top-center" />
            <Navbar />
            {children}
          </ClientSessionProvider>
        </div>
      </body>
    </html>
  );
}
