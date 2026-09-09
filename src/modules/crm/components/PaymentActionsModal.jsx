import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, Repeat, Wallet, Clock, Loader2, ChevronDown, Pencil, Trash2, Plus } from "lucide-react";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function PaymentActionsModal({ isOpen, onClose, pipeline, schedule }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [method, setMethod] = useState("UPI");
  const [remarks, setRemarks] = useState("");
  const [cycleDays, setCycleDays] = useState(30);
  const [cycleCount, setCycleCount] = useState(3);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);
  const [mode, setMode] = useState("loading"); // "loading" | "view" | "edit" | "empty"
  const [deleting, setDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const activeRuleId = React.useRef(null);

  const applyRule = (rule) => {
    if (!rule) return;
    setAmount(String(rule.amount ?? ""));
    setTitle(rule.payment_for ?? "");
    setMethod(rule.payment_method ?? "UPI");
    setCycleDays(rule.cycle_period_days ?? 30);
    setCycleCount(rule.cycle_count ?? 3);
    setStartDate(rule.start_date ?? new Date().toISOString().slice(0, 10));
    setDueDate(rule.due_date || "");
    setRemarks(rule.remarks?.replace(" [one-time pipeline rule]", "") ?? "");
    setIsRecurring(String(rule.cycle_count) !== "1");
    activeRuleId.current = rule.id || null;
  };

  const resetForm = () => {
    setIsRecurring(false);
    setAmount("");
    setTitle("");
    setMethod("UPI");
    setRemarks("");
    setCycleDays(30);
    setCycleCount(3);
    setStartDate(new Date().toISOString().slice(0, 10));
    setDueDate("");
    setError("");
    setSuccess("");
    setMode("loading");
    setConfirmDeleteOpen(false);
    activeRuleId.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    if (schedule?.id) {
      applyRule(schedule);
      return;
    }
    if (pipeline?.amount != null || pipeline?.payment_for != null) {
      applyRule({ ...pipeline, id: pipeline?.scheduleId ?? pipeline?.schedule_id ?? null });
      if (pipeline?.scheduleId ?? pipeline?.schedule_id) return;
    }
    const pid = pipeline?.id;
    if (!pid) return;
    let cancelled = false;
    axios.get("/api/payments/schedules/", { params: { pipeline: pid } })
      .then((r) => {
        if (cancelled) return;
        const list = r.data.results || r.data || [];
        const rule = list.find((s) => s.status === "active") || list[0];
        if (rule) {
          applyRule(rule);
          setMode("view");
        } else {
          // No payment action exists — show the dedicated empty state
          setMode("empty");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("[PaymentActionsModal] Schedule fetch failed for pipeline", pid, e);
          setMode("empty");
        }
      });
    return () => { cancelled = true; };
  }, [isOpen, pipeline?.id]);

  useEffect(() => {
    if (!methodOpen) return;
    const h = (e) => { if (!e.target.closest("[data-method-dropdown]")) setMethodOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [methodOpen]);

  const total = useMemo(() => {
    const a = parseFloat(amount) || 0;
    return isRecurring ? a * (parseInt(cycleCount) || 0) : a;
  }, [amount, isRecurring, cycleCount]);

  const schedulePreview = useMemo(() => {
    if (!isRecurring || !startDate) return [];
    return [new Date(startDate).toISOString().slice(0, 10)];
  }, [isRecurring, startDate]);

  const enterEdit = () => {
    setError("");
    setSuccess("");
    setMode("edit");
  };

  const handleDelete = async () => {
    if (!activeRuleId.current) return;
    setError("");
    setSuccess("");
    setDeleting(true);
    try {
      await axios.delete(`/api/payments/schedules/${activeRuleId.current}/`);
      // Payment action for this pipeline is now null → switch to empty state
      resetForm();
      setMode("empty");
      setConfirmDeleteOpen(false);
      setSuccess("Payment action deleted. You can create a new one.");
    } catch (err) {
      const d = err?.response?.data;
      setError(d ? JSON.stringify(d).slice(0, 220) : "Failed to delete.");
      setConfirmDeleteOpen(false);
    } finally { setDeleting(false); }
  };

  if (!isOpen) return null;

  const submit = async (e) => {
    e?.preventDefault();
    setError(""); setSuccess("");
    if (!pipeline?.id) return setError("No pipeline selected.");
    if (!amount || parseFloat(amount) <= 0) return setError("Enter valid amount.");
    if (!title.trim()) return setError("Payment title required.");
    if (isRecurring) {
      if (cycleDays < 1 || cycleDays > 365) return setError("Cycle 1-365 days.");
      if (cycleCount < 2 || cycleCount > 60) return setError("Count 2-60.");
      if (!startDate) return setError("Start date required.");
    }
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        payment_for: title,
        payment_method: method,
        cycle_period_days: isRecurring ? parseInt(cycleDays) : 30,
        cycle_count: isRecurring ? parseInt(cycleCount) : 1,
        start_date: new Date().toISOString().slice(0, 10),
        due_date: dueDate || null,
        remarks: isRecurring ? remarks : `${remarks} [one-time pipeline rule]`,
      };
      if (activeRuleId.current) {
        await axios.patch(`/api/payments/schedules/${activeRuleId.current}/`, payload);
        setSuccess(isRecurring
          ? `Recurring rule updated: ₹${total.toLocaleString()} over ${cycleCount} cycles.`
          : `One-time pipeline rule updated.`);
      } else {
        payload.pipeline = pipeline.id;
        await axios.post("/api/payments/schedules/", payload);
        setSuccess(isRecurring
          ? `Recurring rule created: ₹${total.toLocaleString()} over ${cycleCount} cycles.`
          : `One-time pipeline rule created.`);
      }
      setTimeout(() => { onClose(); }, 900);
    } catch (err) {
      const d = err?.response?.data;
      setError(d ? JSON.stringify(d).slice(0, 220) : "Failed to save.");
    } finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
        {/* Standalone close button for empty state (no header/footer) */}
        {mode === "empty" && (
          <button onClick={onClose} disabled={loading} className="absolute top-4 right-4 z-20 p-2 text-white/20 hover:text-white rounded-lg border border-white/10 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"><X size={16} /></button>
        )}

        {(mode === "view" || mode === "edit") && (
        <div className="px-8 py-6 border-b border-zinc-800 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-medium text-white uppercase tracking-wider">{activeRuleId.current ? "Payment Actions" : "Create Payment Action"}</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Pipeline: <span className="text-blue-400 font-semibold">{pipeline?.name || "Client"}</span></p>
            </div>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 text-white/20 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"><X size={16} /></button>
        </div>
        )}

        <div className={cn("flex-1 min-h-0 overflow-y-auto custom-scrollbar p-8 space-y-6 transition-all duration-200", mode === "loading" && "flex flex-col items-center justify-center", mode === "empty" && "flex flex-col items-center justify-center", confirmDeleteOpen && "blur-sm opacity-40 pointer-events-none select-none")}>
          {mode === "loading" ? (
            /* ---------- LOADING STATE ---------- */
            <div className="flex flex-col items-center justify-center text-center flex-1 w-full py-12">
              <Loader2 size={28} className="animate-spin text-blue-400" />
              <p className="text-xs text-white/40 uppercase tracking-widest mt-3">Checking payment action…</p>
            </div>
          ) : mode === "empty" ? (
            /* ---------- EMPTY STATE — no payment action enabled ---------- */
            <div className="flex flex-col items-center justify-center text-center flex-1 w-full py-12">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <FaMoneyBillTransfer size={28} />
              </div>
              <h3 className="text-base font-medium text-white uppercase tracking-wider">No payment action enabled</h3>
              <p className="text-xs text-white/40 max-w-[300px] mt-2 leading-relaxed">This pipeline doesn't have any payment action yet. Create one to automate recurring or one-time payments.</p>
              <button onClick={enterEdit} className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md cursor-pointer"><Plus size={14} />Create Payment Action</button>
            </div>
          ) : mode === "view" ? (
            /* ---------- VIEWABLE READ-ONLY SUMMARY ---------- */
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Pipeline</p>
                  <p className="text-sm font-bold text-white truncate">{pipeline?.name || "Client"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Amount</p>
                  <p className="text-sm font-bold text-emerald-400">₹{Number(amount || 0).toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Payment Title</p>
                <p className="text-sm font-medium text-white">{title || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Method</p>
                  <p className="text-xs font-medium text-white uppercase tracking-widest">{method || "—"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Type</p>
                  <p className="text-xs font-medium text-white uppercase tracking-widest">{isRecurring ? `Recurring · every ${cycleDays} days × ${cycleCount}` : "One-time"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Start Date</p>
                  <p className="text-xs font-medium text-white">{startDate || "—"}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Due Date</p>
                  <p className="text-xs font-medium text-white">{dueDate || "—"}</p>
                </div>
              </div>

              {remarks && (
                <div className="rounded-lg border border-zinc-800 bg-white/[0.02] p-4 space-y-1">
                  <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30">Remarks</p>
                  <p className="text-xs text-white/60 whitespace-pre-wrap">{remarks.replace(" [one-time pipeline rule]", "")}</p>
                </div>
              )}

              {error && <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3 font-medium uppercase tracking-wider">{error}</p>}
              {success && <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 font-medium uppercase tracking-wider">{success}</p>}
            </div>
          ) : (
            /* ---------- EDIT FORM ---------- */
          <>
          <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-zinc-900 rounded-lg">
            <div className="space-y-0.5">
              <p className="text-[10px] font-medium uppercase text-white">Recurring</p>
              <p className="text-[9px] text-white/30 uppercase leading-relaxed">Enable to configure cycle & count</p>
            </div>
            <button type="button" onClick={() => setIsRecurring(!isRecurring)} className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none", isRecurring ? "bg-blue-500" : "bg-zinc-800")}>
              <span className={cn("pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200", isRecurring ? "translate-x-4" : "translate-x-0")} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Amount (₹) *</label>
              <Input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="e.g. 50000" className="bg-white/5 border-zinc-800 h-10 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Method</label>
              <div className="relative" data-method-dropdown>
                <button type="button" onClick={() => setMethodOpen((v) => !v)} className="w-full h-10 rounded-md bg-white/5 border border-zinc-800 px-3 flex items-center justify-between text-xs text-white uppercase tracking-widest font-medium hover:bg-white/[0.04] transition-colors">
                  <span>{method}</span><ChevronDown size={14} className={cn("text-white/30 transition-transform", methodOpen && "rotate-180")} />
                </button>
                {methodOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-[600] overflow-hidden py-1">
                    {["Any","UPI","Bank Transfer","Cash","Card","Net Banking"].map((m) => (
                      <button key={m} type="button" onClick={() => { setMethod(m); setMethodOpen(false); }} className={cn("w-full text-left px-4 py-2.5 text-xs hover:bg-white/5 transition-colors", method===m ? "text-white bg-white/5" : "text-white/70 hover:text-white")}>{m}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Payment Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Retainer - Q1" className="bg-white/5 border-zinc-800 h-10 text-sm text-white placeholder:text-white/10 focus:border-blue-500/40" />
          </div>

          {!isRecurring && (
            <div className="space-y-2">
              <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Due Date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-9 rounded-md bg-white/5 border border-zinc-800 px-2 text-xs text-white outline-none focus:border-blue-500/40" />
              <p className="text-[9px] text-white/20 uppercase tracking-widest">If set, deal shows ₹ Pending when overdue & unpaid</p>
            </div>
          )}
          {isRecurring && (
            <div className="rounded-lg border border-zinc-800 bg-white/[0.02] overflow-hidden animate-in fade-in">
              <div className="p-4 space-y-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1.5"><Repeat size={10} /> Recurring Config</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Cycle (days) *</label>
                    <Input type="number" min="1" max="365" value={cycleDays} onChange={(e) => setCycleDays(e.target.value)} className="bg-white/5 border-zinc-800 h-9 text-xs text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Count *</label>
                    <Input type="number" min="2" max="60" value={cycleCount} onChange={(e) => setCycleCount(e.target.value)} className="bg-white/5 border-zinc-800 h-9 text-xs text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Start *</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-9 rounded-md bg-white/5 border border-zinc-800 px-2 text-xs text-white outline-none focus:border-blue-500/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Due Date (optional)</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-9 rounded-md bg-white/5 border border-zinc-800 px-2 text-xs text-white outline-none focus:border-blue-500/40" />
                  <p className="text-[9px] text-white/20 uppercase tracking-widest">Overdue & unpaid cycle shows ₹ Pending</p>
                </div>
                <div className="flex justify-between text-xs border-t border-white/5 pt-3">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Total per deal</span><span className="text-xs font-bold text-white">₹{total.toLocaleString("en-IN")} <span className="text-white/30 font-medium">· {cycleCount} × ₹{(parseFloat(amount || 0)).toLocaleString("en-IN")}</span></span>
                </div>
              </div>
              {schedulePreview.length > 0 && (
                <div className="border-t border-zinc-800 bg-white/[0.02] px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Next due date</span>
                  <span className="text-blue-400 font-mono text-xs font-bold">{schedulePreview[0]}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/30 block">Remarks</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional notes — applies pipeline-wide..." className="w-full bg-white/5 border border-zinc-800 rounded-md p-3 text-xs text-white placeholder:text-white/10 outline-none min-h-[60px] resize-none focus:border-blue-500/40" />
          </div>

          {error && <p className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3 font-medium uppercase tracking-wider">{error}</p>}
          {success && <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 font-medium uppercase tracking-wider">{success}</p>}
          </>
          )}
        </div>

        {/* Confirm delete banner — emerges from top of footer */}
        {confirmDeleteOpen && (
          <div className="px-8 py-4 border-t border-red-500/30 bg-red-500/10 animate-in slide-in-from-bottom-2 fade-in duration-200 shrink-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white">Remove payment rule?</p>
                <p className="text-[10px] text-red-300/70">Removing the payment rule for this pipeline cannot be undone.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setConfirmDeleteOpen(false)} disabled={deleting} className="px-3 py-1.5 rounded-md bg-zinc-900/60 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all cursor-pointer disabled:opacity-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-1.5 rounded-md bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                {deleting && <Loader2 size={11} className="animate-spin" />}{deleting ? "Deleting…" : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {mode === "view" || mode === "edit" ? (
        <div className="px-8 py-6 border-t border-zinc-800 bg-white/[0.01] flex items-center justify-end gap-3 shrink-0">
          {mode === "view" ? (
            <>
              <button onClick={() => setConfirmDeleteOpen(true)} disabled={loading || deleting || confirmDeleteOpen} className="px-6 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2">{(confirmDeleteOpen || deleting) ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}{deleting ? "Deleting…" : "Delete"}</button>
              <button onClick={enterEdit} disabled={loading || deleting || confirmDeleteOpen} className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"><Pencil size={12} />Edit</button>
            </>
          ) : (
            <>
              <button onClick={() => setMode(activeRuleId.current ? "view" : "empty")} disabled={loading} className="px-6 py-2.5 bg-zinc-900/50 border border-zinc-800/80 text-[10px] font-bold text-white/40 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 uppercase tracking-widest transition-all rounded-md cursor-pointer disabled:opacity-50">Cancel</button>
              <button onClick={submit} disabled={loading} className="px-6 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md flex items-center gap-2 disabled:opacity-50">
                {loading && <Loader2 size={12} className="animate-spin" />}Save
              </button>
            </>
          )}
        </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
