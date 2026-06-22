import { useState } from "react";
import { Save, MapPin, Bell, Shield, Building2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "showrooms", label: "Showrooms", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  const handleSave = () => toast.success("Settings saved");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure your dealership and console preferences" />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tab nav */}
        <div className="shrink-0 lg:w-52">
          <nav className="flex gap-1 lg:flex-col">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-ink text-white"
                    : "text-muted hover:bg-canvas-dim hover:text-ink"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="min-w-0 flex-1 space-y-4">
          {activeTab === "general" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Dealership Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Dealership Name</Label>
                      <Input defaultValue="KL7 Garage" />
                    </div>
                    <div>
                      <Label>Legal Name</Label>
                      <Input defaultValue="KL7 Garage Pvt Ltd" />
                    </div>
                    <div>
                      <Label>Primary Phone</Label>
                      <Input defaultValue="+91 98470 11122" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input defaultValue="contact@kl7garage.in" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Website</Label>
                      <Input defaultValue="https://kl7garage.in" />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>GST Number</Label>
                      <Input defaultValue="32AABCX1234Y1Z1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button variant="accent" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save General Settings
              </Button>
            </>
          )}

          {activeTab === "showrooms" && (
            <>
              {(["Ernakulam", "Aluva"] as const).map((name) => (
                <Card key={name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted" /> {name} Showroom
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Display Name</Label>
                        <Input defaultValue={`KL7 Garage — ${name}`} />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input defaultValue={name === "Ernakulam" ? "+91 98460 11111" : "+91 95440 22222"} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Address</Label>
                        <Input
                          defaultValue={
                            name === "Ernakulam"
                              ? "NH 66, Vytilla Junction, Ernakulam, Kerala 682019"
                              : "MG Road, Aluva, Ernakulam, Kerala 683101"
                          }
                        />
                      </div>
                      <div>
                        <Label>Opening Time</Label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                      <div>
                        <Label>Closing Time</Label>
                        <Input type="time" defaultValue="19:00" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="accent" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Showroom Settings
              </Button>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Email Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "New lead submitted", desc: "Get notified when a new lead comes in" },
                    { label: "Lead status change", desc: "When a lead's stage is updated" },
                    { label: "Insurance expiry", desc: "7 days before a bike's insurance expires" },
                    { label: "Bike sold", desc: "Confirmation when a bike is marked sold" },
                    { label: "New staff invite accepted", desc: "When an invited staff member joins" },
                  ].map(({ label, desc }, i) => (
                    <div key={label}>
                      {i > 0 && <Separator />}
                      <div className={`flex items-center justify-between ${i > 0 ? "pt-4" : ""}`}>
                        <div>
                          <div className="text-sm font-medium text-ink">{label}</div>
                          <div className="text-xs text-muted">{desc}</div>
                        </div>
                        <Switch defaultChecked={i < 3} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input defaultValue="+91 98470 11122" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-ink">New lead alerts via WhatsApp</div>
                      <div className="text-xs text-muted">Get a message for every new lead</div>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
              <Button variant="accent" onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Notification Settings
              </Button>
            </>
          )}

          {activeTab === "security" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Password Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Require strong passwords", desc: "Min. 8 characters, mix of letters and numbers" },
                    { label: "Two-factor authentication", desc: "Require OTP via SMS for all staff logins" },
                    { label: "Session timeout (30 min)", desc: "Auto-logout after inactivity" },
                  ].map(({ label, desc }, i) => (
                    <div key={label}>
                      {i > 0 && <Separator />}
                      <div className={`flex items-center justify-between ${i > 0 ? "pt-4" : ""}`}>
                        <div>
                          <div className="text-sm font-medium text-ink">{label}</div>
                          <div className="text-xs text-muted">{desc}</div>
                        </div>
                        <Switch defaultChecked={i === 2} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={() => toast.error("Reset cancelled — this is a demo")}
                  >
                    Reset all data to demo defaults
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
