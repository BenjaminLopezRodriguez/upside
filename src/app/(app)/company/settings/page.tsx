"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building01Icon, ImageUploadIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanySettingsPage() {
  const { data: membership, isLoading } = api.organization.getMyOrg.useQuery();
  const org = membership?.organization;

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (org) {
      setName(org.name);
      setLogoUrl(org.logoUrl ?? "");
    }
  }, [org]);

  const updateOrg = api.organization.updateOrg.useMutation({
    onSuccess: () => toast.success("Company settings saved."),
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateOrg.mutate({ name: name.trim(), logoUrl: logoUrl.trim() || undefined });
  };

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your organization's name and branding.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        {isLoading ? (
          <div className="space-y-5">
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Building01Icon} className="size-3.5" strokeWidth={2} />
                Company name
              </Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-url" className="flex items-center gap-1.5">
                <HugeiconsIcon icon={ImageUploadIcon} className="size-3.5" strokeWidth={2} />
                Logo URL
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="logo-url"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateOrg.isPending || !name.trim()}
              >
                {updateOrg.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
