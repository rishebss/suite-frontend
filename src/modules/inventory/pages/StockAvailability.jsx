import React, { useState } from "react";
import {
  Search, Download, Filter, RefreshCw,
  PackageSearch, X, AlertTriangle, DollarSign,
  Eye, Calendar,
} from "lucide-react";
import Button from "@/components/Button";
import { useStockAvailability, useStockExport, useLowStock, useOutOfStock } from "../hooks/useStock";
import { fetchSnapshot, fetchValuation } from "../services/stockService";

const STATUS_BADGES = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  INACTIVE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const StockAvailability = () => {
  const [filters, setFilters] = useState({ search: "", category: "", brand: "", page: 1, page_size: 50 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("availability"); // availability | low-stock | out-of-stock | valuation
  const [snapshotDate, setSnapshotDate] = useState("");
  const [snapshotData, setSnapshotData] = useState(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [valuationData, setValuationData] = useState(null);
  const [valuationLoading, setValuationLoading] = useState(false);

  const queryParams = { ...filters };
  const { data: stockData, count, loading, error, refetch } = useStockAvailability(queryParams);
  const { data: lowStockData, loading: lowStockLoading, refetch: refetchLowStock } = useLowStock();
  const { data: outOfStockData, loading: outOfStockLoading, refetch: refetchOutOfStock } = useOutOfStock();
  const { loading: exportLoading, exportStock } = useStockExport();

  const handleExport = async () => {
    await exportStock({ format: "csv", ...filters });
  };

  const handleSnapshot = async () => {
    if (!snapshotDate) return;
    setSnapshotLoading(true);
    try {
      const response = await fetchSnapshot({ as_of: snapshotDate });
      setSnapshotData(response.data);
    } catch {
      setSnapshotData(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  const handleValuation = async () => {
    setValuationLoading(true);
    try {
      const response = await fetchValuation();
      setValuationData(response.data);
    } catch {
      setValuationData(null);
    } finally {
      setValuationLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            <PackageSearch size={10} /> Stock
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Stock Availability</h1>
          <p className="text-sm text-white/40 font-medium">
            {activeTab === "availability" && `${count} items tracked`}
            {activeTab === "low-stock" && `${lowStockData.length} items below minimum`}
            {activeTab === "out-of-stock" && `${outOfStockData.length} items out of stock`}
            {activeTab === "valuation" && "Inventory valuation"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "availability" && (
            <>
              <Button variant="secondary" className="w-auto px-3 py-1.5 border-none bg-white/5 hover:bg-white/10 text-white/60 text-[10px] uppercase tracking-widest"
                onClick={() => setShowFilters(!showFilters)}>
                <Filter size={13} className="mr-1.5" /> Filters
              </Button>
              <button onClick={handleExport} disabled={exportLoading}
                className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-medium bg-white/5 hover:bg-white/10 text-white/60 transition-all flex items-center gap-2">
                <Download size={13} /> {exportLoading ? "..." : "Export"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="px-10 py-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          {[
            { id: "availability", label: "Availability", icon: PackageSearch },
            { id: "low-stock", label: "Low Stock", icon: AlertTriangle },
            { id: "out-of-stock", label: "Out of Stock", icon: X },
            { id: "valuation", label: "Valuation", icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${
                  isActive
                    ? "text-white border-blue-400"
                    : "text-white/30 border-transparent hover:text-white/50"
                }`}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Snapshot */}
      {activeTab === "availability" && (
        <div className="px-10 py-4 border-b border-white/5">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Search by item code or name..." value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-gray-800/70 transition-all" />
          </div>
        </div>
      )}

      {/* Snapshot Controls */}
      {activeTab === "availability" && (
        <div className="px-10 py-3 border-b border-white/5 flex items-center gap-3">
          <Calendar size={14} className="text-white/30" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Snapshot As Of:</span>
          <input type="date" value={snapshotDate}
            onChange={(e) => setSnapshotDate(e.target.value)}
            className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20" />
          <button onClick={handleSnapshot} disabled={snapshotLoading || !snapshotDate}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold bg-white/5 hover:bg-white/10 text-white/60 transition-all disabled:opacity-30">
            {snapshotLoading ? "Loading..." : "View"}
          </button>
          <button onClick={() => { refetch(); setSnapshotData(null); }}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold bg-white/5 hover:bg-white/10 text-white/60 transition-all">
            <RefreshCw size={12} className="mr-1" /> Reset
          </button>
        </div>
      )}

      {/* Filters */}
      {showFilters && activeTab === "availability" && (
        <div className="px-10 py-4 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Category</label>
              <input value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 w-32" placeholder="Category ID" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-white/30">Brand</label>
              <input value={filters.brand} onChange={(e) => setFilters((prev) => ({ ...prev, brand: e.target.value }))}
                className="px-3 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-white/20 w-32" placeholder="Brand ID" />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-10 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <main className="flex-1 p-10 pt-6">
        {/* AVAILABILITY TAB */}
        {activeTab === "availability" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>
            ) : snapshotData ? (
              <div>
                <p className="text-xs text-white/30 mb-4">Snapshot as of {snapshotData.as_of_date} — {snapshotData.items?.length || 0} items</p>
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Item</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Physical</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Reserved</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Available</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Cost Value</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Sell Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(snapshotData.items || []).map((item) => (
                        <tr key={item.item_id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                              <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4"><span className="text-sm text-white/70">{item.physical}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-white/70">{item.reserved}</span></td>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-bold ${item.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {item.available}
                            </span>
                          </td>
                          <td className="px-5 py-4"><span className="text-sm text-white/50">{Number(item.cost_value).toFixed(2)}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-white/50">{Number(item.selling_value).toFixed(2)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : stockData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageSearch size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">No stock data</h3>
                <p className="text-sm text-white/20">Create ledger entries to track inventory quantities.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Item</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Physical</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Reserved</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Available</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">In Transit</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Damaged</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Min / Max</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stockData.map((item) => (
                      <tr key={item.item_id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                            <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                            <div className="text-[10px] text-white/30 mt-0.5">
                              {item.category_name}{item.category_name && item.brand_name ? " · " : ""}{item.brand_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-white/70">{item.physical}</span></td>
                        <td className="px-5 py-4"><span className="text-sm text-amber-400/80">{item.reserved}</span></td>
                        <td className="px-5 py-4">
                          <span className={`text-sm font-bold ${item.available > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.available}
                          </span>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-blue-400/70">{item.in_transit}</span></td>
                        <td className="px-5 py-4"><span className="text-sm text-red-400/70">{item.damaged}</span></td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-white/40">
                            {item.min_stock_level || "—"} / {item.max_stock_level || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* LOW STOCK TAB */}
        {activeTab === "low-stock" && (
          <>
            {lowStockLoading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>
            ) : lowStockData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">All stocked up</h3>
                <p className="text-sm text-white/20">No items below their minimum stock level.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Item</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Current</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Min Level</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Reorder</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Max Level</th>
                      <th className="text-right px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Suggested Purchase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {lowStockData.map((item) => (
                      <tr key={item.item_id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                          <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-red-400">{item.current_stock}</span>
                        </td>
                        <td className="px-5 py-4"><span className="text-sm text-white/70">{item.min_stock_level}</span></td>
                        <td className="px-5 py-4"><span className="text-sm text-white/50">{item.reorder_level || "—"}</span></td>
                        <td className="px-5 py-4"><span className="text-sm text-white/50">{item.max_stock_level || "—"}</span></td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-emerald-400">{item.suggested_purchase}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* OUT OF STOCK TAB */}
        {activeTab === "out-of-stock" && (
          <>
            {outOfStockLoading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw size={24} className="text-white/30 animate-spin" /></div>
            ) : outOfStockData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <X size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">Nothing out of stock</h3>
                <p className="text-sm text-white/20">All items have stock available.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Item</th>
                      <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {outOfStockData.map((item) => (
                      <tr key={item.item_id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                          <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-red-400">{item.current_stock}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* VALUATION TAB */}
        {activeTab === "valuation" && (
          <div>
            {!valuationData ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <DollarSign size={48} className="text-white/10 mb-4" />
                <h3 className="text-lg font-semibold text-white/40 mb-1">Inventory Valuation</h3>
                <p className="text-sm text-white/20 mb-4">Calculate the cost and selling value of your inventory.</p>
                <button onClick={handleValuation} disabled={valuationLoading}
                  className="px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black bg-white/10 text-white hover:bg-white/20 transition-all">
                  {valuationLoading ? "Calculating..." : "Calculate Valuation"}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Cost Value</p>
                    <p className="text-2xl font-bold text-white">{Number(valuationData.summary.total_cost_value).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Selling Value</p>
                    <p className="text-2xl font-bold text-emerald-400">{Number(valuationData.summary.total_selling_value).toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Potential Profit</p>
                    <p className="text-2xl font-bold text-blue-400">{Number(valuationData.summary.potential_profit).toLocaleString()}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/5">
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Item</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Qty</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Cost Price</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Sell Price</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Cost Value</th>
                        <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Sell Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {valuationData.items.map((item) => (
                        <tr key={item.item_id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-xs font-mono font-bold text-white/50">{item.item_code}</span>
                            <span className="text-sm font-semibold text-white ml-2">{item.item_name}</span>
                          </td>
                          <td className="px-5 py-4"><span className="text-sm text-white/70">{item.quantity}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-white/50">{item.cost_price ? Number(item.cost_price).toFixed(2) : "—"}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-white/50">{item.selling_price ? Number(item.selling_price).toFixed(2) : "—"}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-white/70">{Number(item.cost_value).toFixed(2)}</span></td>
                          <td className="px-5 py-4"><span className="text-sm text-emerald-400">{Number(item.selling_value).toFixed(2)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StockAvailability;
