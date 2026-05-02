import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TreasureTrovesLive — TikTok Shop Dashboard",
  description: "All-in-one TikTok shop automation: trending products, suppliers, scripts, orders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full flex bg-gray-950 text-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
