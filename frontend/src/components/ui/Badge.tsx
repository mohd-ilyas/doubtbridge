import React from 'react';
import { cn } from '../../lib/utils';
import { getStatusColor } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status';
  status?: string;
}

export function Badge({ className, variant = 'default', status, children, ...props }: BadgeProps) {
  let variantStyles = 'bg-slate-100 text-slate-800';
  
  if (variant === 'status' && status) {
    variantStyles = getStatusColor(status);
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
        variantStyles,
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
}
