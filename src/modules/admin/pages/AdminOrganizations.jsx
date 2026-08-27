/**
 * Admin Organizations Management Page
 * Display and manage organizations
 * Superadmins only
 */
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Loader, ChevronDown, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function AdminOrganizations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrg, setExpandedOrg] = useState(null);
  const [showProductAssignment, setShowProductAssignment] = useState(null);
  const [products, setProducts] = useState([]);

  // Check authorization
  if (user?.role !== "Superadmin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-white/40">
            Only Superadmins can manage organizations
          </p>
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

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/organizations/");
      if (response.data?.success) {
        setOrganizations(response.data.data || []);
        setError(null);
      } else {
        throw new Error("Failed to fetch organizations");
      }
    } catch (err) {
      setError(err.message || "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products/");
      if (response.data?.success) {
        setProducts(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchProducts();
  }, []);

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    if (!searchTerm) return true;
    return (
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Assign product
  const handleAssignProduct = async (orgId, productId) => {
    try {
      const response = await axios.post(
        `/api/organizations/${orgId}/assign-product/`,
        {
          product_id: productId,
        },
      );

      if (response.data?.success) {
        fetchOrganizations();
        setShowProductAssignment(null);
        alert("Product assigned successfully");
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  // Revoke product
  const handleRevokeProduct = async (orgId, productId) => {
    if (!window.confirm("Revoke this product?")) return;

    try {
      const response = await axios.post(
        `/api/organizations/${orgId}/revoke-product/`,
        {
          product_id: productId,
        },
      );

      if (response.data?.success) {
        fetchOrganizations();
        alert("Product revoked successfully");
      }
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

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
            🏢 Management
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Organizations
          </h1>
          <p className="text-sm text-white/40 font-medium">
            Manage customer organizations and their product purchases
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/40 rounded-lg cursor-not-allowed text-sm">
          <Plus size={18} />
          Add Organization (Coming Soon)
        </button>
      </header>

      {/* Content */}
      <div className="px-10 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="Search organizations..."
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
            <span className="text-white/40">Loading organizations...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {!loading && filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40">
              {searchTerm
                ? "No organizations found"
                : "No organizations available"}
            </p>
          </div>
        )}

        {!loading && filteredOrgs.length > 0 && (
          <div className="space-y-4">
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="border border-white/5 rounded-lg overflow-hidden"
              >
                {/* Org Header */}
                <button
                  onClick={() =>
                    setExpandedOrg(expandedOrg === org.id ? null : org.id)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-white">
                        {org.name}
                      </h3>
                      <p className="text-sm text-white/40">@{org.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        org.is_active
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {org.is_active ? "Active" : "Inactive"}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-white/40 transition-transform ${
                        expandedOrg === org.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Org Details */}
                {expandedOrg === org.id && (
                  <div className="p-6 border-t border-white/5 bg-white/[0.01] space-y-4">
                    {/* Owner Info */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/40 mb-2">
                        Owner
                      </p>
                      <p className="text-white">{org.owner_name}</p>
                    </div>

                    {/* Products */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs uppercase tracking-wider text-white/40">
                          Purchased Products
                        </p>
                        <button
                          onClick={() =>
                            setShowProductAssignment(
                              showProductAssignment === org.id ? null : org.id,
                            )
                          }
                          className="text-xs px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"
                        >
                          + Add Product
                        </button>
                      </div>

                      {showProductAssignment === org.id && (
                        <div className="mb-4 p-4 bg-white/[0.02] border border-white/5 rounded space-y-2">
                          <p className="text-sm text-white/60">
                            Select a product to assign:
                          </p>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignProduct(org.id, e.target.value);
                              }
                            }}
                            defaultValue=""
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            <option value="">Choose a product...</option>
                            {products.map((product) => {
                              const alreadyHas = org.products?.some(
                                (p) => p.product?.id === product.id,
                              );
                              return (
                                <option
                                  key={product.id}
                                  value={product.id}
                                  disabled={alreadyHas}
                                >
                                  {product.name}
                                  {alreadyHas ? " (already assigned)" : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      {org.products && org.products.length > 0 ? (
                        <ul className="space-y-2">
                          {org.products.map((purchase) => (
                            <li
                              key={purchase.id}
                              className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                            >
                              <div className="flex-1">
                                <p className="text-white font-medium">
                                  {purchase.product?.name}
                                </p>
                                <p className="text-xs text-white/40">
                                  {purchase.is_valid ? "✓ Valid" : "✗ Expired"}
                                  {purchase.expires_at
                                    ? ` - Expires: ${new Date(purchase.expires_at).toLocaleDateString()}`
                                    : " - Lifetime"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  handleRevokeProduct(
                                    org.id,
                                    purchase.product?.id,
                                  )
                                }
                                className="text-xs px-2 py-1 text-red-400 hover:text-red-300 transition-colors"
                              >
                                Revoke
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-white/40">
                          No products assigned yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
