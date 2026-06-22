import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl! border! border-line! bg-ink! text-white! shadow-lift! font-sans!",
          description: "text-white/60!",
          actionButton: "bg-lime! text-lime-ink!",
          cancelButton: "bg-white/10! text-white!",
        },
      }}
    />
  );
}
