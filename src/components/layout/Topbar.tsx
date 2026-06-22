import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Search, User, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { initials, formatRelativeTime } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: 1, text: "New lead: Arjun Nair is interested in Himalayan 450", time: new Date(Date.now() - 1000 * 60 * 22) },
  { id: 2, text: "Insurance expiring in 3 days — Classic 350 (KL-07-AX-3321)", time: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: 3, text: "Dominar 400 marked as sold by Aiswarya R.", time: new Date(Date.now() - 1000 * 60 * 60 * 20) },
];

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur sm:px-6">
      <button
        onClick={onOpenMobile}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-canvas-dim lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bikes, leads, VIN..."
          className="rounded-full bg-surface pl-10"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-soft transition-colors hover:bg-canvas-dim">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ember ring-2 ring-surface" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 whitespace-normal">
                <span className="text-sm leading-snug">{n.text}</span>
                <span className="text-xs text-muted">{formatRelativeTime(n.time)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-offset-2 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink">
              <Avatar className="h-10 w-10 border border-line">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user ? initials(user.name) : "?"}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="normal-case font-medium text-ink text-sm">
              {user?.name}
              <div className="text-xs font-normal text-muted">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 text-danger focus:text-danger">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
