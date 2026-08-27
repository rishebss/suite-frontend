import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from "lucide-react";
import Button from "@/components/Button";
import { useItemActions } from "../hooks/useItems";

const ItemImportModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const { importItems } = useItemActions();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".csv") ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls"))
    ) {
      setFile(droppedFile);
      setImportResult(null);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    const result = await importItems(formData);
    setImportResult(result);
    setImporting(false);

    if (result.success) {
      setTimeout(() => onSuccess(), 1500);
    }
  };

  const downloadTemplate = () => {
    const csv = "Item Code,Item Name,Category,Unit,Brand,Description\nSKU-001,Sample Item,Electronics,Piece,Dell,A sample item";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inventory_import_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <Upload size={18} className="text-white/60" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Import Items</h2>
              <p className="text-[11px] text-white/40">
                Upload CSV or Excel file
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

        <div className="px-6 py-6 space-y-5">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <span className="text-xs text-white/50">
              Don't have a template?
            </span>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-all"
            >
              <Download size={12} />
              Download template
            </button>
          </div>

          {/* Drop Zone */}
          {!importResult?.success && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-white/30 bg-white/5"
                  : file
                    ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div>
                  <FileSpreadsheet
                    size={32}
                    className="mx-auto text-emerald-400 mb-3"
                  />
                  <p className="text-sm font-semibold text-white mb-1">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-white/40">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload
                    size={32}
                    className="mx-auto text-white/20 mb-3"
                  />
                  <p className="text-sm text-white/50 mb-1">
                    Drop your file here or click to browse
                  </p>
                  <p className="text-[10px] text-white/30">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div
              className={`p-4 rounded-xl border ${
                importResult.success
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  {importResult.success ? (
                    <>
                      <p className="text-sm font-semibold text-emerald-400">
                        Import successful!
                      </p>
                      {importResult.data && (
                        <p className="text-xs text-white/50 mt-1">
                          Created {importResult.data.created_count || 0} items
                          {importResult.data.error_count > 0 &&
                            `, ${importResult.data.error_count} errors`}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-red-400">
                        Import failed
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {importResult.error || "Please check your file and try again."}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import Errors Detail */}
          {importResult?.data?.errors?.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {importResult.data.errors.map((err, i) => (
                <p key={i} className="text-[10px] text-red-400/70">
                  Row {err.index + 2}: {err.error || err.item_code}
                </p>
              ))}
            </div>
          )}

          {/* Required Columns */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">
              Required Columns
            </p>
            <div className="flex flex-wrap gap-2">
              {["Item Code", "Item Name", "Category", "Unit"].map((col) => (
                <span
                  key={col}
                  className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-white/50"
                >
                  {col}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-white/30 mt-2">
              Optional: Brand, Description
            </p>
          </div>

          {/* Action Buttons */}
          {!importResult?.success && (
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                className="px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-black"
                onClick={handleImport}
                disabled={!file || importing}
              >
                <Upload size={14} className="mr-2" />
                {importing ? "Importing..." : "Import Items"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemImportModal;
