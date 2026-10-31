import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'lavender' | 'sand' | 'forest' | 'terracotta' | 'outline' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    sage: 'bg-[#EBF2DE] text-[#3E5C38] border-[#CFDCBA]',
    lavender: 'bg-[#F2ECF7] text-[#553E6B] border-[#DDD1EA]',
    sand: 'bg-[#F7EEDF] text-[#785429] border-[#E9D3B5]',
    forest: 'bg-[#263329] text-[#FBF9F4] border-transparent',
    terracotta: 'bg-[#FCECE9] text-[#8C3A2E] border-[#F2C7C1]',
    outline: 'bg-transparent text-ink border-border',
    default: 'bg-[#EAE5DA] text-ink-muted border-border',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium tracking-wide',
    md: 'text-sm px-3.5 py-1 rounded-full font-medium tracking-wide',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 border transition-colors', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
};

