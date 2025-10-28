import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

interface DividerProps extends ComponentProps<"span"> {
  orientation: "vertical" | "horizontal";
}

export function Divider({ orientation, className, ...props }: DividerProps) {
  return (
    <span
      className={twMerge([
        "w-px bg-zinc-700",
        orientation === "horizontal" ? "w-full h-px" : "h-4",
        className,
      ])}
      {...props}
    />
  );
}
