import React from "react";

const MiniBarChart = ({ data, color = "#3b82f6", height = 132, format }) => {
  const max = Math.max(...data.map((d) => d.value || 0), 1);

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * 100 : 0;
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ height: "100%" }}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(h, d.value > 0 ? 4 : 0)}%`,
                    background: `linear-gradient(to top, ${color}55, ${color})`,
                    boxShadow: d.value > 0 ? `0 0 20px ${color}33` : "none",
                    opacity: d.value > 0 ? 1 : 0.15,
                  }}
                />
              </div>
              <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-black/90 px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {format ? format(d.value) : d.value}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-white/25">
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniBarChart;