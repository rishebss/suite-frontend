import React, { useMemo } from "react";
import { CalendarDays, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentDrawerShell, {
  PaymentRow,
  SectionLabel,
  EmptyState,
  LoadMoreButton,
} from "./PaymentDrawerShell";
import { fmtINR } from "./paymentDrawerUtils";
import usePagedPayments from "../hooks/usePagedPayments";

/** Render a YYYY-MM-DD calendar day as a human label without locale deps. */
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function PaymentDateDetailDrawer({ open, onClose, date }) {
  const query = useMemo(() => (date ? { date } : null), [date]);

  const {
    rows: payments,
    count,
    total,
    hasMore,
    loading,
    loadingMore,
    loadMore,
  } = usePagedPayments({ open, query });

  const summary = [
    { label: "Total Collected", value: fmtINR(total), emphasis: true },
    { label: "Payment Records", value: String(count) },
  ];

  return (
    <PaymentDrawerShell
      open={open}
      onClose={onClose}
      icon={CalendarDays}
      title={formatDate(date) || "Date"}
      subtitle={`Payments recorded on this day · ${count} record${count === 1 ? "" : "s"}`}
      accent="amber"
      footer={
        count > 0
          ? `Showing ${payments.length} of ${count} record${count === 1 ? "" : "s"} · ${fmtINR(total)} collected`
          : null
      }
      loading={loading}
    >
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {count > 0 ? (
          <>
            {/* Day summary */}
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

            {/* Records — the only scrollable region of the drawer */}
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
                  <LoadMoreButton
                    remaining={count - payments.length}
                    loading={loadingMore}
                    onClick={loadMore}
                  />
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div className="shrink-0">
            <EmptyState>
              <span className="flex items-center justify-center gap-1.5">
                <Wallet size={14} className="text-white/20" />
                No payments recorded on this day.
              </span>
            </EmptyState>
          </div>
        )}
      </div>
    </PaymentDrawerShell>
  );
}