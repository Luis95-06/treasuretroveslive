"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Plus, Pencil, Trash2, ShoppingCart } from "lucide-react";

type Order = {
  id: number;
  productName: string;
  category: string;
  salePrice: number;
  supplierCost: number;
  shippingCost: number;
  profit: number;
  profitMargin: number;
  status: string;
  orderedAt: string;
  notes: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-700 text-gray-300",
  shipped: "bg-blue-500/20 text-blue-300",
  delivered: "bg-green-500/20 text-green-300",
  refunded: "bg-red-500/20 text-red-300",
};

const EMPTY_FORM = {
  productName: "", category: "accessories", salePrice: "", supplierCost: "", shippingCost: "0",
  status: "pending", notes: "",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/orders?days=90");
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/orders/${editId}` : "/api/orders";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        salePrice: parseFloat(form.salePrice),
        supplierCost: parseFloat(form.supplierCost),
        shippingCost: parseFloat(form.shippingCost),
      }),
    });
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSaving(false);
    load();
  }

  async function deleteOrder(id: number) {
    if (!confirm("Delete this order?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    load();
  }

  function editOrder(o: Order) {
    setEditId(o.id);
    setForm({
      productName: o.productName,
      category: o.category,
      salePrice: String(o.salePrice),
      supplierCost: String(o.supplierCost),
      shippingCost: String(o.shippingCost),
      status: o.status,
      notes: o.notes ?? "",
    });
    setShowForm(true);
  }

  const totalRevenue = orders.reduce((s, o) => s + o.salePrice, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
  const avgMargin = orders.length > 0 ? orders.reduce((s, o) => s + o.profitMargin, 0) / orders.length : 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Order Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">Track sales, costs, and profit for every order</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white text-sm rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Order
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400">Total Profit</p>
          <p className="text-xl font-bold text-green-400 mt-1">{formatCurrency(totalProfit)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-400">Avg Margin</p>
          <p className="text-xl font-bold text-yellow-400 mt-1">{formatPercent(avgMargin)}</p>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-white mb-4">{editId ? "Edit Order" : "Add Order"}</h2>
            <div className="space-y-3">
              <input placeholder="Product name" value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white">
                {["accessories", "beauty", "apparel", "household", "health", "other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500" />
                <input type="number" placeholder="Supplier cost" value={form.supplierCost} onChange={(e) => setForm({ ...form, supplierCost: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500" />
                <input type="number" placeholder="Shipping" value={form.shippingCost} onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white">
                {["pending", "shipped", "delivered", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Cancel</button>
              <button onClick={save} disabled={saving || !form.productName || !form.salePrice || !form.supplierCost}
                className="flex-1 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm rounded-lg">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No orders yet — add your first one!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="pb-3 pr-4 text-gray-400 font-medium">Product</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Sale</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Cost</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Profit</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Margin</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Status</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Date</th>
                <th className="pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 pr-4 text-white font-medium">{o.productName}</td>
                  <td className="py-3 pr-4 text-right text-gray-300">{formatCurrency(o.salePrice)}</td>
                  <td className="py-3 pr-4 text-right text-gray-400">{formatCurrency(o.supplierCost + o.shippingCost)}</td>
                  <td className="py-3 pr-4 text-right text-green-400 font-medium">{formatCurrency(o.profit)}</td>
                  <td className="py-3 pr-4 text-right text-yellow-400">{formatPercent(o.profitMargin)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${STATUS_COLORS[o.status] ?? "bg-gray-700 text-gray-300"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 text-xs">{new Date(o.orderedAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => editOrder(o)} className="text-gray-400 hover:text-white">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteOrder(o.id)} className="text-gray-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
