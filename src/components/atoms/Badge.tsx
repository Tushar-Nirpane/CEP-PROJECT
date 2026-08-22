import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'crimson' | 'blue' | 'cta' | 'slate';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  size = 'md',
  icon,
  className,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 border border-emerald-300 text-emerald-800',
    amber: 'bg-amber-50 border border-amber-300 text-amber-900',
    crimson: 'bg-red-50 border border-red-300 text-red-800',
    blue: 'bg-[#E8EBEB] border border-[#BEC3C8] text-[#0C3B5D]',
    cta: 'bg-[#AC6953]/15 border border-[#AC6953]/40 text-[#AC6953]',
    slate: 'bg-slate-100 border border-[#BEC3C8] text-[#302D2D]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] gap-1 font-semibold',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full tracking-wide shadow-sm',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
