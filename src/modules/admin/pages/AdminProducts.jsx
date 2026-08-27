/**
 * Admin Products Management Page
 * Display and manage all available products
 * Superadmins only
 */
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Loader, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Check authorization
  if (user?.role !== "Superadmin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/40">Only Superadmins can manage products</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/products/");
      if (response.data?.success) {
        setProducts(response.data.data || []);
        setError(null);
      } else {
        throw new Error("Failed to fetch products");
      }
    } catch (err) {
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="px-10 py-8 flex justify-between items-end border-b border-white/5">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-white/40 hover:text-white mb-4 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            Back to Admin Panel
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            📦 Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Products
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Manage system modules and their assignments
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-lg cursor-not-allowed text-sm">
          <Plus size={18} />
          Add Product (Coming Soon)
        </button>
      </header>

      {/* Content */}
      <div className="px-10 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="text-white/40 animate-spin mr-2" />
            <span className="text-white/40">Loading products...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40">
              {searchTerm
                ? "No products found matching your search"
                : "No products available"}
            </p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {product.name}
                    </h3>
                    <code className="text-xs text-white/40">
                      {product.code}
                    </code>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.is_active
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </span>
                </div>

                {product.description && (
                  <p className="text-sm text-white/60 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-white/40">
                    Created: {new Date(product.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300">
            💡 <strong>Note:</strong> Products are system modules (CRM, HR,
            Inventory, etc.) that organizations can purchase. Use the
            Organizations section to assign products to organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
