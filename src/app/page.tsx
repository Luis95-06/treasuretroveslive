"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Zap, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

type DashboardData = {
  topProducts: Array<{
    score: number | null;
    cvr: number | null;
    cpa: number | null;
    growthPct: number | null;
    isBuyNow: boolean;
    product: { name: string; category: string };
  }>;
  recentOrders: Array<{
    id: number;
    productName: string;
    salePrice: number;
    profit: number;
    status: string;
    orderedAt: string;
  }>;
  profitByDay: Array<{ date: string; revenue: number; profit: number }>;
  totalStats: {
    revenue: number;
    profit: number;
    orders: number;
    avgMargin: number;
    bestProduct: string;
  };
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-gray-400",
  shipped: "text-blue-400",
  delivered: "text-green-400",
  refunded: "text-red-400",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const chartData = data
    ? period === "weekly"
      ? aggregateWeekly(data.profitByDay)
      : data.profitByDay
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">@TreasureTrovesLive — overview of your TikTok shop</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<DollarSign className="w-4 h-4 text-blue-400" />} label="Revenue (30d)" value={formatCurrency(data?.totalStats.revenue ?? 0)} />
        <KPICard icon={<TrendingUp className="w-4 h-4 text-green-400" />} label="Profit (30d)" value={formatCurrency(data?.totalStats.profit ?? 0)} color="text-green-400" />
        <KPICard icon={<ShoppingCart className="w-4 h-4 text-pink-400" />} label="Orders (30d)" value={String(data?.totalStats.orders ?? 0)} />
        <KPICard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Avg Margin" value={formatPercent(data?.totalStats.avgMargin ?? 0)} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Top Products This Week</h2>
          <div className="space-y-3">
            {data?.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-gray-500 font-mono w-4">#{i + 1}</span>
                  <div>
                    <p className="text-sm text-white font-medium flex items-center gap-1">
                      {p.product.name}
                      {p.isBuyNow && <Zap className="w-3 h-3 text-yellow-400" />}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{p.product.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  {p.cvr != null && <span className="text-xs text-green-400">{formatPercent(p.cvr)} CVR</span>}
                  <ScoreBadge score={p.score} />
                </div>
              </div>
            ))}
            {(!data || data.topProducts.length === 0) && (
              <p className="text-sm text-gray-500">No product data yet — run a scrape or seed the DB.</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data?.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{o.productName}</p>
                  <p className={`text-xs capitalize ${STATUS_COLORS[o.status] ?? "text-gray-400"}`}>{o.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-400">{formatCurrency(o.profit)}</p>
                  <p className="text-xs text-gray-500">{new Date(o.orderedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {(!data || data.recentOrders.length === 0) && (
              <p className="text-sm text-gray-500">No orders yet — add some in the Orders tab.</p>
            )}
          </div>
        </div>
      </div>

      {/* Profit Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Revenue & Profit (30 days)</h2>
          <div className="flex gap-1">
            {(["daily", "weekly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs rounded-lg capitalize transition-colors ${period === p ? "bg-pink-500 text-white" : "text-gray-400 hover:bg-gray-700"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                labelStyle={{ color: "#f9fafb", fontSize: 12 }}
                formatter={(v: unknown, name: unknown) => [formatCurrency(v as number), name === "revenue" ? "Revenue" : "Profit"]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" opacity={0.6} radius={[2, 2, 0, 0]} />
              <Line dataKey="profit" stroke="#22c55e" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, color = "text-white" }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs text-gray-400">{label}</p></div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color = score >= 80 ? "bg-green-500/20 text-green-300" : score >= 60 ? "bg-yellow-500/20 text-yellow-300" : "bg-gray-700 text-gray-400";
  return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{score.toFixed(0)}</span>;
}

function aggregateWeekly(data: Array<{ date: string; revenue: number; profit: number }>) {
  const weeks: Record<string, { date: string; revenue: number; profit: number }> = {};
  data.forEach((d, i) => {
    const week = `W${Math.floor(i / 7) + 1}`;
    if (!weeks[week]) weeks[week] = { date: week, revenue: 0, profit: 0 };
    weeks[week].revenue += d.revenue;
    weeks[week].profit += d.profit;
  });
  return Object.values(weeks);
}
