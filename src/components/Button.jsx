import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 active:scale-[0.98]',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 active:scale-[0.98]',
  };

  return (
    <button
      className={`w-full py-2.5 px-5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
