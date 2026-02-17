
import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`custom-gradient-btn px-6 py-3 rounded-xl text-white font-semibold shadow-lg transform active:scale-95 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
