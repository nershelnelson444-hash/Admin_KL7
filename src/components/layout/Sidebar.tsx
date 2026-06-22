import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Bike,
  Images,
  GalleryHorizontal,
  Users,
  ShieldCheck,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/inventory", label: "Inventory", icon: Bike },
  { to: "/media", label: "Media Library", icon: Images },
  { to: "/gallery", label: "Gallery", icon: GalleryHorizontal },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/users", label: "Staff & Users", icon: ShieldCheck },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-ink text-white transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          collapsed ? "w-[84px]" : "w-[252px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* brand */}
        <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-0")}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime font-display text-base font-bold text-lime-ink">
            K7
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-base font-bold tracking-tight">KL7 GARAGE</div>
              <div className="text-[11px] uppercase tracking-wider text-white/40">Dealer Console</div>
            </div>
          )}
        </div>

        <TooltipProvider delayDuration={200}>
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const link = (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white",
                      collapsed && "justify-center",
                      isActive && "bg-lime text-lime-ink hover:bg-lime hover:text-lime-ink font-semibold"
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );

              if (!collapsed) return link;

              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        <div className="space-y-1 border-t border-white/10 px-3 py-3">
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white",
                collapsed && "justify-center",
                isActive && "bg-white/10 text-white"
              )
            }
          >
            <Settings className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5",
              collapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
              {user ? initials(user.name) : "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-medium text-white">{user?.name ?? "Guest"}</div>
                <div className="truncate text-xs text-white/40">{user?.role ?? ""}</div>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => logout()}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>

          <button
            onClick={onToggle}
            className={cn(
              "hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white lg:flex",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? <ChevronsRight className="h-[18px] w-[18px]" /> : <ChevronsLeft className="h-[18px] w-[18px]" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
