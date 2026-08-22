import React from 'react';
import { clsx } from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}) => {
  return (
    <div
      className={clsx(
        'p-5 rounded-2xl bg-white border border-[#BEC3C8] shadow-card hover:shadow-cardHover transition-shadow',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#2C638A]">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-[#E8EBEB] text-[#0C3B5D]">
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0C3B5D]">{value}</div>
        {subtitle && <p className="text-xs text-[#302D2D]/70 font-medium mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-2 text-[11px] font-bold text-[#2C638A]">
          {trend}
        </div>
      )}
    </div>
  );
};
