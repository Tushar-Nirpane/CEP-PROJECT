import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none shadow-sm';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 shadow-md',
  };

  const variantStyles = {
    primary: 'bg-[#0C3B5D] hover:bg-[#2C638A] text-white focus:ring-[#0C3B5D]',
    secondary: 'bg-[#AC6953] hover:bg-[#8E523F] text-white focus:ring-[#AC6953]',
    cta: 'bg-[#AC6953] hover:bg-[#8E523F] text-white focus:ring-[#AC6953]',
    outline: 'bg-white border border-[#BEC3C8] hover:bg-[#E8EBEB] text-[#0C3B5D] focus:ring-[#0C3B5D]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'text-[#0C3B5D] hover:bg-[#E8EBEB] hover:text-[#2C638A] shadow-none',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
