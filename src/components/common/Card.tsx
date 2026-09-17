import React from 'react';
import { cn } from '../../utils/formatters';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'outline';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-800/80 border border-slate-700/60',
    glass: 'bg-[#1C2541]/80 backdrop-blur-md border border-white/10 shadow-lg',
    elevated: 'bg-[#253256] border border-white/15 shadow-xl',
    outline: 'bg-transparent border border-slate-700/80'
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
