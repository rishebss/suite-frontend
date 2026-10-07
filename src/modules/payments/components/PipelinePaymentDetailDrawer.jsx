import React, { useEffect, useMemo, useState } from "react";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import PaymentDrawerShell, {
  PaymentRow,
  SectionLabel,
  EmptyState,
  LoadMoreButton,
} from "./PaymentDrawerShell";
import { fmtINR } from "./paymentDrawerUtils";
import usePagedPayments from "../hooks/usePagedPayments";
import { fetchPipeline, fetchSchedules } from "../services/paymentsService";

function MetaRows({ rows }) {
  return (
    <div className="divide-y divide-white/5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 py-2.5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 shrink-0">
            {r.label}
          </span>
          <span
            className={cn(
              "text-xs text-right break-words",
              r.emphasis ? "text-emerald-400" : "text-white/80"
            )}
          >
            {r.value || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PipelinePaymentDetailDrawer({ open, onClose, pipelineId }) {
  const [pipeline, setPipeline] = useState(null);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (!open || !pipelineId) return;
    let cancelled = false;
    Promise.allSettled([
      fetchPipeline(pipelineId),
      fetchSchedules({ pipeline: pipelineId }),
    ])
      .then(([plRes, sRes]) => {
        if (cancelled) return;
        if (plRes.status === "fulfilled") setPipeline(plRes.value.data);
        if (sRes.status === "fulfilled") {
          const d = sRes.value.data;
          setSchedules(d.results || d || []);
        }
      })
      .finally(() => {
        if (!cancelled) setPipelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, pipelineId]);

  const query = useMemo(() => (pipelineId ? { pipeline: pipelineId } : null), [pipelineId]);
  const {
    rows: payments,
    count,
    total,
    hasMore,
    loading: paymentsLoading,
    loadingMore,
    loadMore,
  } = usePagedPayments({ open, query });

  const activeRule = schedules.find((s) => s.status === "active") || schedules[0] || null;

  const overview = [
    { label: "Type", value: pipeline?.pipeline_type },
    { label: "Assignment", value: pipeline?.assignment_type },
    { label: "Deals", value: pipeline?.deals_count ?? "—" },
    { label: "Payment Records", value: String(count) },
    { label: "Collected", value: fmtINR(total), emphasis: true },
  ];

  const dueOn = activeRule?.next_due_date || activeRule?.due_date;
  const ruleRows = activeRule
    ? [
        { label: "Payment For", value: activeRule.payment_for },
        { label: "Amount", value: fmtINR(activeRule.amount) },
        { label: "Method", value: activeRule.payment_method },
        {
          label: "Cycle",
          value:
            String(activeRule.cycle_count) === "1"
              ? "One-time"
              : `Recurring ×${activeRule.cycle_count} · every ${activeRule.cycle_period_days}d`,
        },
        { label: "Next Due", value: dueOn ? new Date(dueOn).toLocaleDateString("en-GB") : "—" },
        { label: "Status", value: activeRule.status },
      ]
    : [];

  return (
    <PaymentDrawerShell
      open={open}
      onClose={onClose}
      icon={GitBranch}
      title={pipeline?.name || "Pipeline"}
      subtitle={`Pipeline · ${pipeline?.pipeline_type || "—"}`}
      accent="blue"
      footer={count > 0 ? `Showing ${payments.length} of ${count} payment${count === 1 ? "" : "s"} · ${fmtINR(total)} collected` : null}
      loading={pipelineLoading || paymentsLoading}
    >
      <div className="space-y-6">
        {pipeline?.description ? (
          <p className="text-[11px] text-white/40 leading-relaxed">{pipeline.description}</p>
        ) : null}

        <MetaRows rows={overview} />

        <div className="space-y-2">
          <SectionLabel>Payment Rule</SectionLabel>
          {!activeRule ? (
            <EmptyState>No payment rule configured.</EmptyState>
          ) : (
            <MetaRows rows={ruleRows} />
          )}
        </div>

        <div className="mt-8 space-y-3">
          <SectionLabel>Payments Recorded ({count})</SectionLabel>
          <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-2.5 min-h-[260px] max-h-[340px] overflow-y-auto custom-scrollbar">
            {payments.length === 0 ? (
              <EmptyState>No payments recorded in this pipeline.</EmptyState>
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
