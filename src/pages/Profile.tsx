import { Save, Camera } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/lib/utils";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();

  const handleSave = () => toast.success("Profile updated");

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your account details and preferences" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar card */}
        <Card className="flex flex-col items-center gap-4 p-6 text-center lg:col-span-1">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-line">
              <AvatarFallback className="bg-ink text-lime font-display text-3xl font-bold">
                {user ? initials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-lime text-lime-ink shadow-soft hover:brightness-95 transition-all">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <div className="font-display text-lg font-bold text-ink">{user?.name}</div>
            <div className="text-sm text-muted">{user?.email}</div>
            <div className="mt-2">
              <Badge variant="accent">{user?.role}</Badge>
            </div>
          </div>
          <Separator />
          <div className="w-full space-y-2 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Showrooms</span>
              <span className="font-medium text-ink">Both</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Deals closed</span>
              <span className="font-display font-bold text-ink">142</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Member since</span>
              <span className="font-medium text-ink">Feb 2022</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input defaultValue={user?.name} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" defaultValue={user?.email} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input defaultValue="+91 98470 11122" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={user?.role ?? ""} readOnly className="bg-canvas cursor-not-allowed" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Min. 8 characters" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="Repeat new password" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="accent" onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" /> Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
