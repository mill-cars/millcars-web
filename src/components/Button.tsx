import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center font-bold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary:
    'bg-primary text-on-primary shadow-xl shadow-primary/20 hover:bg-primary-container hover:text-primary',
  secondary:
    'bg-surface-container-lowest text-primary border border-outline-variant/15 hover:bg-surface-container-low',
  outline:
    'bg-transparent text-primary border border-primary hover:bg-primary/10',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-8 py-4 text-base',
  lg: 'px-12 py-5 text-lg',
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
