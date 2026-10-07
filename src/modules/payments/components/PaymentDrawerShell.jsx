import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import RingLoader from "@/components/ui/RingLoader";
import { fmtINR } from "./paymentDrawerUtils";

const ACCENTS = {
  emerald: { chip: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: "text-emerald-400" },
  blue: { chip: "bg-blue-500/10 border-blue-500/20 text-blue-400", icon: "text-blue-400" },
  purple: { chip: "bg-purple-500/10 border-purple-500/20 text-purple-400", icon: "text-purple-400" },
};

export function PaymentRow({ p }) {
  const [open, setOpen] = useState(false);
  const pipeline = p.crm_details?.pipeline_name || p.pipeline_name || "—";
  const details = [
    { label: "Contact", value: p.contact_details?.name },
    { label: "Pipeline", value: pipeline },
    { label: "Payment For", value: p.payment_for },
    { label: "Invoice", value: p.invoice },
    { label: "Method", value: p.payment_method },
  ];
  return (
    <div className="rounded-lg bg-white/[0.02] border border-zinc-900 hover:border-zinc-800 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left cursor-pointer"
      >
        <span className="shrink-0 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] uppercase tracking-[0.1em] text-emerald-400">{fmtINR(p.amount)}</span>
        <span className="ml-auto shrink-0 text-[9px] text-white/30 tabular-nums">{p.created_at ? new Date(p.created_at).toLocaleDateString("en-GB") : "—"}</span>
        <ChevronDown size={12} className={cn("shrink-0 text-white/25 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-1">
          {details.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 w-24 shrink-0">{d.label}</span>
              <span className="text-[11px] text-white/70 truncate">{d.value || "—"}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LoadMoreButton({ remaining, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full py-2 border-t border-white/5 text-[10px] font-medium uppercase tracking-widest text-blue-400 hover:bg-white/5 transition-all disabled:opacity-50"
    >
      {loading ? "Loading…" : `Load more${remaining > 0 ? ` (${remaining} left)` : ""}`}
    </button>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">{children}</p>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-xl px-4 py-8 min-h-[96px]">
      <p className="text-xs font-medium text-white/25 text-center">{children}</p>
    </div>
  );
}

export default function PaymentDrawerShell({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  accent = "emerald",
  headerExtra,
  footer,
  loading = false,
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  const a = ACCENTS[accent] || ACCENTS.emerald;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[1040] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 bottom-0 z-[1050] w-[min(420px,90vw)] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn("w-8 h-8 rounded-md border flex items-center justify-center shrink-0", a.chip)}>
              {Icon ? <Icon size={14} className={a.icon} /> : null}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm text-white tracking-tight uppercase truncate">
                {title}
              </h3>
              {subtitle ? (
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-medium mt-0.5 truncate">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {headerExtra ? (
          <div className="shrink-0 px-5 py-3 border-b border-zinc-800 bg-white/[0.01]">
            {headerExtra}
          </div>
        ) : null}

        {/* Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center flex-1 text-white/20 min-h-0">
            <RingLoader />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 space-y-2 p-5">
            {children}
          </div>
        )}

        {footer ? (
          <div className="shrink-0 px-5 py-3 border-t border-zinc-800 bg-black/30">
            <p className="text-[9px] text-white/25 uppercase tracking-widest font-medium truncate">
              {footer}
            </p>
          </div>
        ) : null}
      </div>
    </>,
    document.body
  );
}
