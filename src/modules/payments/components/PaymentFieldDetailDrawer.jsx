import React, { useMemo } from "react";
import { Receipt, Wallet, CreditCard, CalendarDays } from "lucide-react";
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
  date: { label: "Date", icon: CalendarDays, accent: "amber" },
};

export default function PaymentFieldDetailDrawer({ open, onClose, field, value }) {
  const meta = FIELD_META[field] || FIELD_META.payment_for;

  // Date is not a searchable text field — it maps to the `date` query param.
  const query = useMemo(() => {
    if (!value) return null;
    return field === "date" ? { date: value } : { search: value, search_field: field };
  }, [field, value]);
  const {
    rows: payments,
    count,
    total,
    hasMore,
    loading,
    loadingMore,
    loadMore,
  } = usePagedPayments({ open, query });

  const isDate = field === "date";
  // The date view always shows the day's total + its records, even for a
  // single payment, so it never collapses into the single-payment layout.
  const single = count === 1 && !isDate ? payments[0] : null;

  // The date drawer only carries the day's collected total plus the records
  // (the section heading already shows the record count).
  const summary = isDate
    ? [{ label: "Total Collected", value: fmtINR(total), emphasis: true }]
    : [
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
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {count > 1 || (isDate && count > 0) ? (
          /* Summary — plain rows, label left / value right */
          <div className="shrink-0 divide-y divide-white/5">
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
          <div className="shrink-0 space-y-3">
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
        ) : count > 0 ? (
          /* Records — the only scrollable region of the drawer */
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="shrink-0">
              <SectionLabel>Payment Records ({count})</SectionLabel>
            </div>
            <div className="flex-1 min-h-[200px] rounded-lg border border-zinc-800 bg-white/[0.02] p-2.5 overflow-y-auto custom-scrollbar">
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
          <div className="shrink-0">
            <EmptyState>No matching payments.</EmptyState>
          </div>
        )}
      </div>
    </PaymentDrawerShell>
  );
}
