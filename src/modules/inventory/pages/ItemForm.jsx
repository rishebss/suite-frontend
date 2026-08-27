import React, { useState, useEffect } from "react";
import { X, Save, Box } from "lucide-react";
import Button from "@/components/Button";
import { useItemActions } from "../hooks/useItems";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const ItemForm = ({ item, categories, units, brands, onClose, onSuccess }) => {
  const isEditing = !!item;
  const { createItem, updateItem, loading } = useItemActions();
  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category: "",
    sub_category: "",
    unit: "",
    brand: "",
    description: "",
    status: "ACTIVE",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (item) {
      setFormData({
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        category: item.category || "",
        sub_category: item.sub_category || "",
        unit: item.unit || "",
        brand: item.brand || "",
        description: item.description || "",
        status: item.status || "ACTIVE",
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const errors = {};
    if (!formData.item_code.trim()) errors.item_code = "Item code is required";
    if (!formData.item_name.trim()) errors.item_name = "Item name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare payload
    const payload = {
      ...formData,
      category: formData.category || null,
      unit: formData.unit || null,
      brand: formData.brand || null,
    };

    let result;
    if (isEditing) {
      result = await updateItem(item.id, payload);
    } else {
      result = await createItem(payload);
    }

    if (result.success) {
      onSuccess();
    } else {
      // Handle server validation errors
      if (result.errors) {
        const serverErrors = {};
        Object.entries(result.errors).forEach(([key, msgs]) => {
          serverErrors[key] = Array.isArray(msgs) ? msgs[0] : msgs;
        });
        setFormErrors(serverErrors);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <Box size={18} className="text-white/60" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? "Edit Item" : "Create Item"}
              </h2>
              <p className="text-[11px] text-white/40">
                {isEditing
                  ? `Editing ${item.item_code}`
                  : "Add a new item to your catalog"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Item Code */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Item Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.item_code}
                onChange={(e) => handleChange("item_code", e.target.value)}
                disabled={isEditing}
                placeholder="e.g. SKU-001"
                className={`w-full px-4 py-2.5 bg-gray-800/50 border rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all ${
                  formErrors.item_code
                    ? "border-red-500/50"
                    : "border-white/10"
                } ${isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {formErrors.item_code && (
                <p className="mt-1 text-[10px] text-red-400">
                  {formErrors.item_code}
                </p>
              )}
            </div>

            {/* Item Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Item Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => handleChange("item_name", e.target.value)}
                placeholder="e.g. Enterprise Server Rack"
                className={`w-full px-4 py-2.5 bg-gray-800/50 border rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all ${
                  formErrors.item_name
                    ? "border-red-500/50"
                    : "border-white/10"
                }`}
              />
              {formErrors.item_name && (
                <p className="mt-1 text-[10px] text-red-400">
                  {formErrors.item_name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {cat.category_name || cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.sub_category}
                onChange={(e) => handleChange("sub_category", e.target.value)}
                placeholder="e.g. Server Racks"
                className="w-full px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Select unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {u.unit_name || u.name} ({u.symbol || u.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Brand
              </label>
              <select
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {b.brand_name || b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ backgroundColor: '#1f2937', color: '#fff' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Item description..."
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black"
              disabled={loading}
            >
              <Save size={14} className="mr-2" />
              {loading ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
