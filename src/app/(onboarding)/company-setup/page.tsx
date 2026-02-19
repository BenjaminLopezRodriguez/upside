"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building01Icon, ImageUploadIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanySetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const completeSetup = api.organization.completeSetup.useMutation({
    onSuccess: () => {
      toast.success("Company set up successfully!");
      router.push("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    completeSetup.mutate({
      name: name.trim(),
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HugeiconsIcon icon={Building01Icon} className="size-5 text-primary" strokeWidth={2} />
        </div>
        <CardTitle className="text-xl">Set up your company</CardTitle>
        <CardDescription>
          Tell us about your organization. You can always update these details later in Settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name *</Label>
            <Input
              id="company-name"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
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
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={completeSetup.isPending || !name.trim()}
          >
            {completeSetup.isPending ? (
              "Setting up…"
            ) : (
              <>
                Continue to Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1.5 size-4" strokeWidth={2} />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
