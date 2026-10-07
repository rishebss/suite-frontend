export const fmtINR = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export const STATUS_STYLES = {
  Paid: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  Due: "bg-red-500/10 border-red-500/20 text-red-400",
  "Payment Pending": "bg-purple-500/10 border-purple-500/20 text-purple-400",
  Lead: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};
