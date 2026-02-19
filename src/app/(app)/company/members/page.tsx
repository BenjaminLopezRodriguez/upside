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
} from "@hugeicons/core-free-icons";
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

  const issueCard = api.card.issueForMember.useMutation({
    onSuccess: () => {
      toast.success(`Card issued to ${member.user.name}`);
      onOpenChange(false);
      setCardName("");
      setSpendLimit("500");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitDollars = parseFloat(spendLimit);
    if (!cardName.trim() || isNaN(limitDollars) || limitDollars < 1) return;
    issueCard.mutate({ orgId, memberId: member.id, cardName: cardName.trim(), type, spendLimit: Math.round(limitDollars * 100) });
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
