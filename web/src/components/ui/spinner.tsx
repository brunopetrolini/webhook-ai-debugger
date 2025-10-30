import { twMerge } from "tailwind-merge";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={twMerge(
        "inline-block size-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-zinc-200 motion-reduce:animate-[spin_1.5s_linear_infinite]",
        className,
      )}
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
}
