import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers, useCreateUser, useUpdateUserStatus, useDeleteUser } from "@/hooks/useUsers";
import { initials, formatRelativeTime } from "@/lib/utils";
import type { AdminUser, UserRole, UserStatus } from "@/types";
import type { UserInput } from "@/services/users.service";

const STATUS_BADGE: Record<UserStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "ok",
  invited: "warn",
  suspended: "outline",
};

const ROLE_COLORS: Record<UserRole, string> = {
  Owner: "bg-lime text-lime-ink",
  Admin: "bg-ink text-white",
  "Sales Executive": "bg-canvas-dim text-ink",
  Support: "bg-canvas-dim text-muted",
};

export default function Users() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserInput>>({
    role: "Sales Executive",
    showroom: "Ernakulam",
    status: "invited",
  });

  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateStatus = useUpdateUserStatus();
  const deleteUser = useDeleteUser();

  const handleInvite = () => {
    if (!form.name || !form.email || !form.phone) return;
    createUser.mutate(form as UserInput, { onSuccess: () => setInviteOpen(false) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff & Users"
        description="Manage team members across both showrooms"
        actions={
          <Button variant="accent" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" /> Invite Staff
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead>
              <tr className="bg-canvas">
                {["Staff Member", "Role", "Showroom", "Deals Closed", "Status", "Last Active", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (users ?? []).map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-canvas-dim text-xs font-semibold">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-ink">{user.name}</div>
                            <div className="text-xs text-muted">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink">{user.showroom}</td>
                      <td className="px-4 py-3 font-display font-bold text-ink">{user.dealsClosed}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE[user.status]}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatRelativeTime(user.lastActive)}</td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 items-center justify-center rounded-full opacity-0 hover:bg-canvas-dim group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.status === "active" && (
                              <DropdownMenuItem onClick={() => updateStatus.mutate({ id: user.id, status: "suspended" })}>
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {user.status === "suspended" && (
                              <DropdownMenuItem onClick={() => updateStatus.mutate({ id: user.id, status: "active" })}>
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-danger focus:text-danger"
                              onClick={() => {
                                if (confirm(`Remove ${user.name}?`)) deleteUser.mutate(user.id);
                              }}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite Staff Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Arjun Nair"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="arjun@kl7garage.in"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 9XXXXXXXXX"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserRole }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Showroom</Label>
                <Select
                  value={form.showroom}
                  onValueChange={(v) => setForm((f) => ({ ...f, showroom: v as AdminUser["showroom"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ernakulam">Ernakulam</SelectItem>
                    <SelectItem value="Aluva">Aluva</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleInvite}
              variant="accent"
              className="w-full"
              disabled={!form.name || !form.email || createUser.isPending}
            >
              {createUser.isPending ? "Sending invite…" : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
