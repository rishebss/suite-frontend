import React from 'react';

const Input = ({ label, type = 'text', placeholder, rightSlot, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-white/40 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-md text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200 focus:bg-white/[0.05] focus:border-white/20 ${rightSlot ? 'pr-10' : ''} ${className || ''}`}
          {...props}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2.5 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
