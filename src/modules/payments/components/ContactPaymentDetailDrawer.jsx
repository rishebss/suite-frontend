import React, { useEffect, useMemo, useState } from "react";
import { User, Mail, Phone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentDrawerShell, {
  PaymentRow,
  SectionLabel,
  EmptyState,
  LoadMoreButton,
} from "./PaymentDrawerShell";
import { fmtINR, STATUS_STYLES } from "./paymentDrawerUtils";
import usePagedPayments from "../hooks/usePagedPayments";
import { fetchContact } from "../services/paymentsService";

export default function ContactPaymentDetailDrawer({ open, onClose, contactId }) {
  const [contact, setContact] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);

  useEffect(() => {
    if (!open || !contactId) return;
    let cancelled = false;
    fetchContact(contactId)
      .then((res) => {
        if (!cancelled) setContact(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setContactLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, contactId]);

  const query = useMemo(() => (contactId ? { contact: contactId } : null), [contactId]);
  const {
    rows: payments,
    count,
    total,
    hasMore,
    loading: paymentsLoading,
    loadingMore,
    loadMore,
  } = usePagedPayments({ open, query });

  const name = contact?.name || "Contact";
  const status = contact?.status;

  const identity = [
    { Icon: Mail, label: "Email", value: contact?.email },
    { Icon: Phone, label: "Phone", value: contact?.phone },
    { Icon: Wallet, label: "Total Amount", value: fmtINR(total), emphasis: true },
  ];

  return (
    <PaymentDrawerShell
      open={open}
      onClose={onClose}
      icon={User}
      title={name}
      subtitle={`Contact · ${contact?.contact_id || "—"}`}
      accent="emerald"
      footer={count > 0 ? `Showing ${payments.length} of ${count} payment${count === 1 ? "" : "s"} · ${fmtINR(total)} collected` : null}
      loading={contactLoading || paymentsLoading}
    >
      <div className="space-y-6">
        {/* Status + identity */}
        <div className="flex flex-wrap items-center gap-2">
          {status ? (
            <span
              className={cn(
                "px-2.5 py-1 rounded border text-[9px] uppercase tracking-[0.15em]",
                STATUS_STYLES[status] || "border-white/10 bg-white/5 text-white/40"
              )}
            >
              {status === "Payment Pending" ? "Pending" : status}
            </span>
          ) : null}
          {contact?.source ? (
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-[0.15em] text-white/40">
              {contact.source}
            </span>
          ) : null}
        </div>

        <div className="rounded-lg border border-zinc-900 bg-white/[0.02] divide-y divide-white/5">
          {identity.map((row) => (
            <div key={row.label} className="flex items-center gap-3 px-3 py-2.5">
              <row.Icon size={13} className="text-white/25 shrink-0" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 w-32 shrink-0 whitespace-nowrap">
                {row.label}
              </span>
              <span className={cn("text-xs truncate", row.emphasis ? "text-emerald-400" : "text-white/80")}>
                {row.value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Payments */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2">
            <SectionLabel>Payment Records ({count})</SectionLabel>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-2.5 min-h-[260px] max-h-[340px] overflow-y-auto custom-scrollbar">
            {payments.length === 0 ? (
              <EmptyState>No payments recorded yet.</EmptyState>
            ) : (
              <div className="space-y-1.5">
                {payments.map((p) => (
                  <PaymentRow key={p.id} p={p} />
                ))}
              </div>
            )}
            {hasMore ? (
              <LoadMoreButton remaining={count - payments.length} loading={loadingMore} onClick={loadMore} />
            ) : null}
          </div>
        </div>
      </div>
    </PaymentDrawerShell>
  );
}
