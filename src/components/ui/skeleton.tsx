import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-canvas-dim", className)} {...props} />
  );
}

export { Skeleton };
