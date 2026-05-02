import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import MuiProvider from "@/components/MuiProvider";
import NavBar from "@/components/NavBar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Notify — Notification Platform",
  description: "Real-time campus notification system for Placements, Results, and Events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <MuiProvider>
            <NavBar />
            <main>{children}</main>
          </MuiProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
