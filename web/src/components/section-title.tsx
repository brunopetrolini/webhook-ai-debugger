import type { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface SectionTitleProps extends ComponentProps<'h3'> {
  children: ReactNode;
}

export function SectionTitle({
  children,
  className,
  ...props
}: SectionTitleProps) {
  return (
    <h3
      className={twMerge(['text-base font-semibold text-zinc-100', className])}
      {...props}
    >
      {children}
    </h3>
  );
}
