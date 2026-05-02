"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Search, FileText, ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: TrendingUp },
  { href: "/opportunities", label: "Opportunities", icon: Search },
  { href: "/suppliers", label: "Suppliers", icon: Package },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-gray-900 border-r border-gray-800 h-full sticky top-0">
      <div className="px-4 py-5 border-b border-gray-800">
        <p className="text-xs text-pink-400 font-semibold uppercase tracking-widest">TikTok Shop</p>
        <p className="text-sm font-bold text-white mt-0.5">TreasureTrovesLive</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === href
                ? "bg-pink-500/20 text-pink-300 font-medium"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">@TreasureTrovesLive</p>
      </div>
    </aside>
  );
}
