import { Spinner } from "./ui/spinner";

export function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className="size-8" />
    </div>
  );
}
