"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, Package } from "lucide-react";

type Product = { id: number; name: string; category: string };
type Supplier = {
  id: number;
  productTitle: string;
  supplierName: string | null;
  supplierPrice: number;
  shippingDays: number | null;
  moq: number | null;
  productUrl: string | null;
  source: string;
};

export default function SuppliersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [targetPrice, setTargetPrice] = useState("15");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products?days=30")
      .then((r) => r.json())
      .then((data: Array<{ product: Product }>) => {
        const unique = Array.from(new Map(data.map((d) => [d.product.id, d.product])).values());
        setProducts(unique);
      });
  }, []);

  async function loadSuppliers(productId: number) {
    setLoading(true);
    const res = await fetch(`/api/suppliers?productId=${productId}`);
    const data = await res.json();
    setSuppliers(data);
    setLoading(false);
  }

  async function findSuppliers() {
    if (!selectedProductId) return;
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    setSearching(true);
    await fetch("/api/suppliers/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: selectedProductId, query: product.name }),
    });
    setTimeout(() => {
      loadSuppliers(selectedProductId);
      setSearching(false);
    }, 15_000);
  }

  function margin(supplierPrice: number) {
    const sale = parseFloat(targetPrice) || 0;
    if (sale <= 0) return null;
    const profit = sale - supplierPrice;
    return { profit, pct: (profit / sale) * 100 };
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Supplier Matcher</h1>
        <p className="text-sm text-gray-400 mt-0.5">Find CJDropshipping suppliers for trending products</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
          value={selectedProductId ?? ""}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            setSelectedProductId(id);
            loadSuppliers(id);
          }}
        >
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Target sale price:</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-24 pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
            />
          </div>
        </div>

        <button
          onClick={findSuppliers}
          disabled={!selectedProductId || searching}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          {searching ? "Searching (~15s)..." : "Find Suppliers"}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Package className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Select a product and click "Find Suppliers"</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="pb-3 pr-4 text-gray-400 font-medium">Product</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium">Supplier</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Price</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Ship Days</th>
                <th className="pb-3 pr-4 text-gray-400 font-medium text-right">Margin</th>
                <th className="pb-3 text-gray-400 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s, i) => {
                const m = margin(s.supplierPrice);
                return (
                  <tr key={s.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${i === 0 ? "bg-green-500/5" : ""}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {i === 0 && <span className="text-xs text-green-400 font-bold">BEST</span>}
                        <span className="text-white">{s.productTitle}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{s.supplierName ?? "—"}</td>
                    <td className="py-3 pr-4 text-right text-white font-medium">{formatCurrency(s.supplierPrice)}</td>
                    <td className="py-3 pr-4 text-right text-gray-300">{s.shippingDays != null ? `${s.shippingDays}d` : "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      {m ? (
                        <span className={m.pct >= 50 ? "text-green-400" : m.pct >= 20 ? "text-yellow-400" : "text-red-400"}>
                          {m.pct.toFixed(0)}% ({formatCurrency(m.profit)})
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full uppercase">{s.source}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
