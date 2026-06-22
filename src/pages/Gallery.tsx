import { useEffect, useRef } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

export default function Library() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Curator.io widget script
    const existingScript = document.getElementById("curator-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "curator-script";
      script.async = true;
      script.charset = "UTF-8";
      script.src = "https://cdn.curator.io/published/your-feed-id.js"; // replace with real feed id
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        description="Instagram posts and reels from KL7 Garage — powered by Curator.io"
        actions={
          <a
            href="https://curator.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-canvas-dim"
          >
            <ExternalLink className="h-4 w-4" /> Manage Feed on Curator.io
          </a>
        }
      />

      {/* Curator.io info card */}
      <Card className="border-dashed border-2 border-line bg-canvas/50">
        <CardContent className="py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
            {/* Instagram icon */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
              <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-bold text-ink">Connect your Instagram feed</h3>
              <p className="text-sm text-muted leading-relaxed max-w-xl">
                This page uses <strong className="text-ink">Curator.io</strong> to automatically pull your latest Instagram posts and reels.
                To activate the feed, replace the placeholder feed ID in <code className="rounded bg-canvas-dim px-1.5 py-0.5 text-xs font-mono text-ink">Library.tsx</code> with your real Curator.io published feed ID.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href="https://curator.io/dashboard" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink/80 transition-colors">
                  <ExternalLink className="h-3 w-3" /> Open Curator Dashboard
                </a>
                <a href="https://curator.io/docs" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-muted shadow-soft hover:text-ink transition-colors">
                  View Docs
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curator.io embed container */}
      <div ref={containerRef}>
        {/* Curator.io widget will inject here once feed ID is configured */}
        <div id="curator-feed-default-feed-layout">
          <a href="https://curator.io" target="_blank" rel="noreferrer" className="crt-logo crt-tag">
            Powered by Curator.io
          </a>
        </div>
      </div>

      {/* Fallback placeholder grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-card bg-canvas-dim" />
        ))}
      </div>
      <p className="text-center text-xs text-muted">
        Placeholder grid — will be replaced by your live Instagram feed once Curator.io is configured.
      </p>
    </div>
  );
}
