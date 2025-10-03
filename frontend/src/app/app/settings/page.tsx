"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Building, 
  Settings as SettingsIcon, 
  Bell, 
  DollarSign,
  Shield,
  Save
} from "lucide-react";
import { z } from "zod";
import { copy } from "@/lib/i18n";
import { useSettings, useUpdateSettings, useUpdateProfile, useChangePassword } from "@/hooks/use-api";
import { useAuth } from "@/contexts/auth-context";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
});

const PreferencesSchema = z.object({
  safetyBuffer: z.number().min(0).max(1000),
  emailSummary: z.boolean(),
  currency: z.string(),
});

type ProfileData = z.infer<typeof ProfileSchema>;
type PreferencesData = z.infer<typeof PreferencesSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "organization" | "preferences">("profile");
  const { user } = useAuth();
  
  // API hooks
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      company: user?.company || "",
    },
  });

  const preferencesForm = useForm<PreferencesData>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      safetyBuffer: settings?.safetyBuffer || 50,
      emailSummary: settings?.emailSummary || true,
      currency: settings?.defaultCurrency || "USD",
    },
  });

  // Update form values when settings data loads
  useEffect(() => {
    if (settings) {
      preferencesForm.reset({
        safetyBuffer: settings.safetyBuffer,
        emailSummary: settings.emailSummary,
        currency: settings.defaultCurrency,
      });
    }
  }, [settings, preferencesForm]);

  const onProfileSubmit = async (data: ProfileData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      console.log("Profile updated:", data);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const onPreferencesSubmit = async (data: PreferencesData) => {
    try {
      await updateSettingsMutation.mutateAsync({
        safetyBuffer: data.safetyBuffer,
        defaultCurrency: data.currency,
        emailSummary: data.emailSummary,
      });
      console.log("Preferences updated:", data);
    } catch (error) {
      console.error("Preferences update error:", error);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{copy.settings.title}</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`
                        w-full flex items-center px-4 py-3 text-left text-sm font-medium transition-colors
                        ${activeTab === tab.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {copy.settings.profile}
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                        className={profileForm.formState.errors.name ? "border-destructive" : ""}
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                        className={profileForm.formState.errors.email ? "border-destructive" : ""}
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...profileForm.register("company")}
                      className={profileForm.formState.errors.company ? "border-destructive" : ""}
                    />
                    {profileForm.formState.errors.company && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.company.message}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Organization Tab */}
          {activeTab === "organization" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {copy.settings.organization}
                </CardTitle>
                <CardDescription>
                  Manage your organization settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      defaultValue="Acme Corp"
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-domain">Organization Domain</Label>
                    <Input
                      id="org-domain"
                      defaultValue="acmecorp.com"
                      placeholder="Enter organization domain"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-size">Organization Size</Label>
                    <Select defaultValue="small">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">1-10 employees</SelectItem>
                        <SelectItem value="medium">11-50 employees</SelectItem>
                        <SelectItem value="large">51-200 employees</SelectItem>
                        <SelectItem value="enterprise">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Settings
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Session Timeout</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically sign out after inactivity
                        </div>
                      </div>
                      <Select defaultValue="30">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  {copy.settings.preferences}
                </CardTitle>
                <CardDescription>
                  Customize your application preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financial Settings
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="safety-buffer">Safety Buffer (basis points)</Label>
                      <Input
                        id="safety-buffer"
                        type="number"
                        {...preferencesForm.register("safetyBuffer", { valueAsNumber: true })}
                        className={preferencesForm.formState.errors.safetyBuffer ? "border-destructive" : ""}
                      />
                      <p className="text-xs text-muted-foreground">
                        Extra margin above benchmark rate to recommend "Take" (default: 50 bps)
                      </p>
                      {preferencesForm.formState.errors.safetyBuffer && (
                        <p className="text-sm text-destructive">
                          {preferencesForm.formState.errors.safetyBuffer.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select
                        value={preferencesForm.watch("currency")}
                        onValueChange={(value) => preferencesForm.setValue("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Daily Email Summary</div>
                        <div className="text-sm text-muted-foreground">
                          Receive daily reports of invoice recommendations
                        </div>
                      </div>
                      <Switch
                        checked={preferencesForm.watch("emailSummary")}
                        onCheckedChange={(checked) => preferencesForm.setValue("emailSummary", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Urgent Deadline Alerts</div>
                        <div className="text-sm text-muted-foreground">
                          Get notified when discount deadlines are approaching
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Rate Change Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Be notified when benchmark rates change significantly
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSettingsMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
