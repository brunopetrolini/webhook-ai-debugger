import type { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends ComponentProps<'span'> {
  children: ReactNode;
}

export function Badge({ children, className, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        'px-3 py-1 rounded-lg border font-mono text-sm font-semibold border-zinc-600 bg-zinc-800 text-zinc-100',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
