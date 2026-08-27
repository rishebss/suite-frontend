import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, X, Info } from "lucide-react";

const typeStyles = {
  success: "bg-green-500/10 border-green-500/20 text-green-400",
  error: "bg-red-500/10 border-red-500/20 text-red-400",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
};

const typeIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function Toast({ id, message, type = "error", duration = 4000, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const Icon = typeIcons[type] || AlertCircle;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-2xl ${typeStyles[type] || typeStyles.error} animate-in slide-in-from-right-2`}
      style={{
        animation: "slideIn 0.3s ease-out",
        minWidth: 300,
        maxWidth: 450,
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={() => onDismiss(id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
}
