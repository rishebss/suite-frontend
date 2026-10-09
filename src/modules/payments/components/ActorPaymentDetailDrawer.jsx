import React, { useMemo, useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentDrawerShell, {
  PaymentRow,
  SectionLabel,
  EmptyState,
  LoadMoreButton,
} from "./PaymentDrawerShell";
import { fmtINR } from "./paymentDrawerUtils";
import usePagedPayments from "../hooks/usePagedPayments";

const actorName = (a) => {
  if (!a) return "—";
  const full =
    `${a.first_name || ""} ${a.last_name || ""}`.trim();
  return full || a.email || String(a.id) || "—";
};

export default function ActorPaymentDetailDrawer({
  open,
  onClose,
  actorId,
  actorDetails,
}) {
  const identitySource = actorDetails || {};

  const query = useMemo(
    () => (actorId ? { recorded_by: actorId } : null),
    [actorId]
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

  const name = actorName(identitySource);

  const identity = [
    { label: "Full Name", value: actorName(identitySource) },
    { label: "Total Amount", value: fmtINR(total), emphasis: true },
  ];

  return (
    <PaymentDrawerShell
      open={open}
      onClose={onClose}
      icon={User}
      title={name}
      subtitle={`Actor · recorded ${count} payment${count === 1 ? "" : "s"}`}
      accent="emerald"
      footer={
        count > 0
          ? `Showing ${payments.length} of ${count} payment${count === 1 ? "" : "s"} · ${fmtINR(total)} collected`
          : null
      }
      loading={loading}
    >
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Actor identity */}
        <div className="shrink-0 rounded-lg border border-zinc-900 bg-white/[0.02] divide-y divide-white/5">
          {identity.map((row) => (
            <div
              key={row.label}
              className="flex items-center gap-3 px-3 py-2.5"
            >
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 w-32 shrink-0 whitespace-nowrap">
                {row.label}
              </span>
              <span
                className={cn(
                  "text-xs truncate",
                  row.emphasis ? "text-emerald-400" : "text-white/80"
                )}
              >
                {row.value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Payments — the only scrollable region of the drawer */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <SectionLabel>Payment Records ({count})</SectionLabel>
          </div>
          <div className="flex-1 min-h-[200px] rounded-lg border border-zinc-800 bg-white/[0.02] p-2.5 overflow-y-auto custom-scrollbar">
            {payments.length === 0 ? (
              <EmptyState>No payments recorded by this actor.</EmptyState>
            ) : (
              <div className="space-y-1.5">
                {payments.map((p) => (
                  <PaymentRow key={p.id} p={p} />
                ))}
              </div>
            )}
            {hasMore ? (
              <LoadMoreButton
                remaining={count - payments.length}
                loading={loadingMore}
                onClick={loadMore}
              />
            ) : null}
          </div>
        </div>
      </div>
    </PaymentDrawerShell>
  );
}
