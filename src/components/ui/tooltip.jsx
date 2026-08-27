import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const Tooltip = ({ children, content, className, disabled, wide, position = "bottom" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isHovered && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const gap = 8;

      if (position === "top") {
        setTooltipStyle({
          left: `${rect.left}px`,
          minWidth: `${rect.width}px`,
          top: `${rect.top - gap}px`,
          transform: 'translateY(-100%)',
        });
      } else {
        setTooltipStyle({
          left: `${rect.left}px`,
          minWidth: `${rect.width}px`,
          top: `${rect.bottom + gap}px`,
        });
      }
    }
  }, [isHovered, position]);

  if (disabled || !content) return children;

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", wide ? "w-full" : "inline-block")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && createPortal(
        <div
          style={tooltipStyle}
          className={cn(
            "fixed z-[9999] px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl pointer-events-none",
            className
          )}
        >
          <p className="text-[10px] text-white/70 leading-relaxed whitespace-nowrap">{content}</p>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;
