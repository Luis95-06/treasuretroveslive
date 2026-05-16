"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  FileText,
  ShoppingCart,
  Package,
  ClipboardList,
  KanbanSquare,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const TTL_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: TrendingUp },
  { href: "/opportunities", label: "Opportunities", icon: Search },
  { href: "/suppliers", label: "Suppliers", icon: Package },
  { href: "/scripts", label: "Scripts", icon: FileText },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
];

const PHM_NAV = [
  { href: "/phm/audit", label: "Audit Tool", icon: ClipboardList },
  { href: "/phm/pipeline", label: "Pipeline", icon: KanbanSquare },
];

function NavSection({
  label,
  accent,
  items,
  pathname,
}: {
  label: string;
  accent: string;
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
}) {
  return (
    <div className="space-y-1">
      <p className={`px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-widest ${accent}`}>
        {label}
      </p>
      {items.map(({ href, label: itemLabel, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === href || (href !== "/" && pathname.startsWith(href))
              ? "bg-pink-500/20 text-pink-300 font-medium"
              : "text-gray-400 hover:text-white hover:bg-gray-800"
          )}
        >
          <Icon className="w-4 h-4" />
          {itemLabel}
        </Link>
      ))}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const content = (
    <>
      <div className="px-4 py-5 border-b border-gray-800">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Operator OS</p>
        <p className="text-sm font-bold text-white mt-0.5">Luis's Dashboard</p>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-2 overflow-y-auto">
        <NavSection
          label="TTL — TreasureTroves"
          accent="text-pink-400"
          items={TTL_NAV}
          pathname={pathname}
        />
        <div className="border-t border-gray-800 mt-2" />
        <NavSection
          label="PHM — Packed House"
          accent="text-purple-400"
          items={PHM_NAV}
          pathname={pathname}
        />
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">@TreasureTrovesLive</p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 md:hidden"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col bg-gray-900 border-r border-gray-800 h-full sticky top-0">
        {content}
      </aside>

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-gray-900 border-r border-gray-800 transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {content}
      </aside>
    </>
  );
}
