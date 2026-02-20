"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  UserAdd01Icon,
  CreditCardIcon,
  MoneyReceiveSquareIcon,
  MoreVerticalIcon,
  Attachment01Icon,
  CustomizeIcon,
} from "@hugeicons/core-free-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useOrg } from "@/contexts/org-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Member = {
  id: number;
  userId: number;
  role: string;
  user: { name: string; email: string };
};

const CARD_COLOR_OPTIONS = [
  { value: "lime", bg: "bg-lime-400" },
  { value: "sky", bg: "bg-sky-400" },
  { value: "amber", bg: "bg-amber-400" },
  { value: "rose", bg: "bg-rose-400" },
  { value: "violet", bg: "bg-violet-400" },
  { value: "emerald", bg: "bg-emerald-400" },
] as const;

const MATERIAL_OPTIONS = [
  { label: "Plastic", value: "plastic" },
  { label: "Metal", value: "metal" },
];

function IssueCardDialog({
  member,
  orgId,
  open,
  onOpenChange,
}: {
  member: Member;
  orgId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [cardName, setCardName] = useState("");
  const [type, setType] = useState<"virtual" | "physical">("virtual");
  const [spendLimit, setSpendLimit] = useState("500");
  const [cardColor, setCardColor] = useState("lime");
  const [logoUrl, setLogoUrl] = useState("");
  const [material, setMaterial] = useState("plastic");

  const issueCard = api.card.issueForMember.useMutation({
    onSuccess: () => {
      toast.success(`Card issued to ${member.user.name}`);
      onOpenChange(false);
      setCardName("");
      setSpendLimit("500");
      setCardColor("lime");
      setLogoUrl("");
      setMaterial("plastic");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitDollars = parseFloat(spendLimit);
    if (!cardName.trim() || isNaN(limitDollars) || limitDollars < 1) return;
    issueCard.mutate({
      orgId,
      memberId: member.id,
      cardName: cardName.trim(),
      type,
      spendLimit: Math.round(limitDollars * 100),
      cardColor,
      logoUrl: logoUrl.trim() || undefined,
      material: type === "physical" ? material : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue card to {member.user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="card-name">Card name</Label>
            <Input
              id="card-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="e.g. Travel expenses"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-type">Card type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "virtual" | "physical")}>
              <SelectTrigger id="card-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="spend-limit">Spend limit ($)</Label>
            <Input
              id="spend-limit"
              type="number"
              min={1}
              step={1}
              value={spendLimit}
              onChange={(e) => setSpendLimit(e.target.value)}
              required
            />
          </div>

          <Collapsible className="rounded-lg border border-border">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HugeiconsIcon icon={CustomizeIcon} className="size-4 shrink-0" strokeWidth={2} />
                <span>Customize</span>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-4 border-t border-border px-4 py-3">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCardColor(opt.value)}
                        className={cn(
                          "size-8 rounded-full border-2 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          opt.bg,
                          cardColor === opt.value
                            ? "border-foreground shadow-md"
                            : "border-transparent hover:shadow",
                        )}
                        title={opt.value}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input
                    id="logo-url"
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                {type === "physical" && (
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger id="material">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={issueCard.isPending || !cardName.trim()}>
              {issueCard.isPending ? "Issuing…" : "Issue card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptBinDialog({
  member,
  open,
  onOpenChange,
}: {
  member: Member;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receipt bin — {member.user.name}</DialogTitle>
        </DialogHeader>
        <div className="pt-1">
          <UploadDropzone
            endpoint="receiptUpload"
            onClientUploadComplete={() => {
              toast.success("Receipts uploaded successfully");
            }}
            onUploadError={(err) => { toast.error(err.message); }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({ member, orgId }: { member: Member; orgId: number }) {
  const [issueCardOpen, setIssueCardOpen] = useState(false);
  const [receiptBinOpen, setReceiptBinOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {member.user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">{member.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={member.role === "owner" ? "default" : "secondary"}>
            {member.role}
          </Badge>
          {member.role !== "owner" && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="size-8">
                    <HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} className="size-4" />
                    <span className="sr-only">Member actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIssueCardOpen(true)}>
                  <HugeiconsIcon icon={CreditCardIcon} strokeWidth={2} className="size-4 mr-2" />
                  Issue card
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <HugeiconsIcon icon={MoneyReceiveSquareIcon} strokeWidth={2} className="size-4 mr-2" />
                  Request reimbursement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReceiptBinOpen(true)}>
                  <HugeiconsIcon icon={Attachment01Icon} strokeWidth={2} className="size-4 mr-2" />
                  Receipt bin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <IssueCardDialog
        member={member}
        orgId={orgId}
        open={issueCardOpen}
        onOpenChange={setIssueCardOpen}
      />

      <ReceiptBinDialog
        member={member}
        open={receiptBinOpen}
        onOpenChange={setReceiptBinOpen}
      />
    </>
  );
}

export default function MembersPage() {
  const { activeOrgId } = useOrg();

  const { data: members, isLoading } = api.organization.listMembers.useQuery(
    { orgId: activeOrgId! },
    { enabled: activeOrgId != null },
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team and their access permissions.
          </p>
        </div>
        <Button disabled>
          <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="mr-2 size-4" />
          Invite member
        </Button>
      </div>

      <div className="divide-y rounded-xl border bg-card">
        {isLoading || activeOrgId == null ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : members && members.length > 0 ? (
          members.map((m) => (
            <MemberRow key={m.id} member={m} orgId={activeOrgId} />
          ))
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <HugeiconsIcon
              icon={UserGroupIcon}
              strokeWidth={1.5}
              className="size-10 text-muted-foreground/50"
            />
            <p className="text-sm text-muted-foreground">
              No members yet. Invite your team to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
