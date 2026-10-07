import React, { useMemo } from "react";
import { Receipt, Wallet, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentDrawerShell, {
  PaymentRow,
  SectionLabel,
  EmptyState,
  LoadMoreButton,
} from "./PaymentDrawerShell";
import { fmtINR } from "./paymentDrawerUtils";
import usePagedPayments from "../hooks/usePagedPayments";

const FIELD_META = {
  invoice: { label: "Invoice", icon: Receipt, accent: "purple" },
  payment_for: { label: "Payment For", icon: Wallet, accent: "emerald" },
  method: { label: "Payment Method", icon: CreditCard, accent: "blue" },
};

export default function PaymentFieldDetailDrawer({ open, onClose, field, value }) {
  const meta = FIELD_META[field] || FIELD_META.payment_for;

  const query = useMemo(
    () => (value ? { search: value, search_field: field } : null),
    [field, value]
  );
  const {
    rows: payments,
    count,
    total,
    hasMore,
    loading,
    loadingMore,
    loadMore,
  } = usePagedPayments({ open, query });

  const single = count === 1 ? payments[0] : null;

  const summary = [
    { label: "Total Collected", value: fmtINR(total), emphasis: true },
    { label: "Payment Records", value: String(count) },
  ];
  const singleDetails = single
    ? [
        { label: "Contact", value: single.contact_details?.name },
        { label: "Pipeline", value: single.crm_details?.pipeline_name || single.pipeline_name },
        { label: "Payment For", value: single.payment_for },
        { label: "Invoice", value: single.invoice },
        { label: "Method", value: single.payment_method },
        {
          label: "Date",
          value: single.created_at ? new Date(single.created_at).toLocaleDateString("en-GB") : "—",
        },
        { label: "Amount", value: fmtINR(single.amount), emphasis: true },
      ]
    : [];

  return (
    <PaymentDrawerShell
      open={open}
      onClose={onClose}
      icon={meta.icon}
      title={value || meta.label}
      subtitle={`${meta.label} · ${count} payment${count === 1 ? "" : "s"}`}
      accent={meta.accent}
      footer={count > 0 ? `Showing ${payments.length} of ${count} payment${count === 1 ? "" : "s"} · ${fmtINR(total)} collected` : null}
      loading={loading}
    >
      <div className="space-y-6">
        {count > 1 ? (
          /* Summary — plain rows, label left / value right */
          <div className="divide-y divide-white/5">
            {summary.map((a) => (
              <div key={a.label} className="flex items-center justify-between gap-4 py-2.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 shrink-0">
                  {a.label}
                </span>
                <span
                  className={cn(
                    "text-xs text-right break-words",
                    a.emphasis ? "text-emerald-400" : "text-white/80"
                  )}
                >
                  {a.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {single ? (
          /* Single match — show the payment straight through, no list */
          <div className="space-y-3">
            <SectionLabel>Payment Details</SectionLabel>
            <div className="divide-y divide-white/5">
              {singleDetails.map((a) => (
                <div key={a.label} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 shrink-0">
                    {a.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs text-right break-words",
                      a.emphasis ? "text-emerald-400" : "text-white/80"
                    )}
                  >
                    {a.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : count > 1 ? (
          <div className="space-y-3">
            <SectionLabel>Payment Records ({count})</SectionLabel>
            <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-2.5 max-h-[340px] overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                {payments.map((p) => (
                  <PaymentRow key={p.id} p={p} />
                ))}
              </div>
              {hasMore ? (
                <LoadMoreButton remaining={count - payments.length} loading={loadingMore} onClick={loadMore} />
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState>No matching payments.</EmptyState>
        )}
      </div>
    </PaymentDrawerShell>
  );
}
