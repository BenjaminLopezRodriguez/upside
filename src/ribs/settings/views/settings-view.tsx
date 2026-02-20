"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Locker01Icon,
  SecurityIcon,
  FileImportIcon,
  LinkSquare02Icon,
  Palette,
  Building01Icon,
  Delete02Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { SettingsRib } from "../rib";
import { useOrg } from "@/contexts/org-context";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { DetailRow } from "@/components/detail-row";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsView() {
  const vm = SettingsRib.useViewModel();
  const { activeOrgId, activeMembership, mode } = useOrg();
  const org = activeMembership?.organization;
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (org) {
      setCompanyName(org.name);
      setLogoUrl(org.logoUrl ?? "");
    }
  }, [org]);

  const updateOrg = api.organization.updateOrg.useMutation({
    onSuccess: () => toast.success("Company settings saved."),
    onError: (err) => toast.error(err.message),
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || activeOrgId == null) return;
    updateOrg.mutate({
      orgId: activeOrgId,
      name: companyName.trim(),
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  const isOrgLoading = activeOrgId == null || !activeMembership;

  return (
    <div className="animate-page-in space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account, preferences, and organization."
      />

      <Tabs value={vm.activeTab} onValueChange={vm.setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
          <TabsTrigger value="danger">Danger zone</TabsTrigger>
        </TabsList>

        {/* ——— Account: privacy, security, import/export, integrations ——— */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Locker01Icon} className="size-5" strokeWidth={2} />
                Privacy
              </CardTitle>
              <CardDescription>
                Control who can see your profile and activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow label="Profile visibility" value="Only your organization" />
              <Separator />
              <DetailRow label="Activity visibility" value="Members only" />
              <p className="text-xs text-muted-foreground">
                Fine-grained privacy options coming soon.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={SecurityIcon} className="size-5" strokeWidth={2} />
                Security
              </CardTitle>
              <CardDescription>
                Password, two-factor authentication, and sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow label="Password" value="••••••••••••" />
              <Separator />
              <DetailRow label="Two-factor auth" value="Not enabled" />
              <Separator />
              <DetailRow label="Active sessions" value="This device" />
              <Button variant="outline" size="sm">
                Change password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={FileImportIcon} className="size-5" strokeWidth={2} />
                Import / Export
              </CardTitle>
              <CardDescription>
                Download your data or import from another service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DetailRow label="Data export" value="Request a copy of your data" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export my data
                </Button>
                <Button variant="outline" size="sm">
                  Import data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={LinkSquare02Icon} className="size-5" strokeWidth={2} />
                Integrations
              </CardTitle>
              <CardDescription>
                Connect apps and services to Upside.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No integrations connected. Connect Slack, accounting software, or other tools from here.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Browse integrations
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>
                {vm.teamMembers.length} people in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vm.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-muted-foreground">{member.email}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ——— Personalization: colors, logo, company name ——— */}
        <TabsContent value="personalization" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Palette} className="size-5" strokeWidth={2} />
                Appearance
              </CardTitle>
              <CardDescription>
                Theme and display preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                {mounted ? (
                  <Select
                    value={resolvedTheme ?? "system"}
                    onValueChange={(v) => setTheme(v)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Skeleton className="h-10 w-[180px]" />
                )}
              </div>
            </CardContent>
          </Card>

          {mode === "org" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Building01Icon} className="size-5" strokeWidth={2} />
                  Company name & logo
                </CardTitle>
                <CardDescription>
                  Display name and logo for this organization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isOrgLoading ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCompanySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="settings-company-name">Company name</Label>
                      <Input
                        id="settings-company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-logo-url">Logo URL</Label>
                      <Input
                        id="settings-logo-url"
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <Button type="submit" disabled={updateOrg.isPending || !companyName.trim()}>
                      {updateOrg.isPending ? "Saving…" : "Save"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          {mode === "personal" && (
            <Card>
              <CardHeader>
                <CardTitle>Organization branding</CardTitle>
                <CardDescription>
                  Switch to an organization to edit its name and logo.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* ——— Danger zone: irreversible actions ——— */}
        <TabsContent value="danger" className="mt-6 space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              Irreversible actions. These cannot be undone.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Deleting your account or organization will permanently remove all associated data.
            </p>
          </div>

          {mode === "org" && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <HugeiconsIcon icon={Logout03Icon} className="size-5" strokeWidth={2} />
                  Leave organization
                </CardTitle>
                <CardDescription>
                  Leave this organization. You will lose access to its data and members. You can be re-invited later.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="destructive" size="sm">
                        Leave organization
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave organization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will lose access to this organization and its data. You can rejoin if invited again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => toast.info("Leave organization not yet implemented.")}
                      >
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {mode === "org" && org && (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <HugeiconsIcon icon={Delete02Icon} className="size-5" strokeWidth={2} />
                  Delete organization
                </CardTitle>
                <CardDescription>
                  Permanently delete &quot;{org.name}&quot; and all its data. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="destructive" size="sm">
                        Delete organization
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this organization?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All data, members, and history for &quot;{org.name}&quot; will be permanently deleted. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => toast.info("Delete organization not yet implemented.")}
                      >
                        Delete organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <HugeiconsIcon icon={Delete02Icon} className="size-5" strokeWidth={2} />
                Delete account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all personal data. Organizations you own must be transferred or deleted first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button variant="destructive" size="sm">
                      Delete my account
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your account and all associated data will be permanently removed. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => toast.info("Delete account not yet implemented.")}
                    >
                      Delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
