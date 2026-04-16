import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const base =
  'inline-flex min-h-12 cursor-pointer select-none items-center justify-center rounded-2xl border font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-surface active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants = {
  primary:
    'border-primary bg-primary text-on-primary shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-container hover:text-primary hover:shadow-xl hover:shadow-primary/25',
  secondary:
    'border-slate-300 bg-white text-on-surface shadow-sm hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md',
  outline:
    'border-primary bg-transparent text-primary hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-md',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3 text-base',
  lg: 'px-8 py-4 text-base sm:text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
