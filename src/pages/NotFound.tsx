import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-lime">
        <Compass className="h-8 w-8" />
      </div>
      <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-ink">404</h1>
      <p className="mt-2 max-w-sm text-muted">
        This page took a wrong turn. It's not in the showroom and it's not in the workshop either.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
