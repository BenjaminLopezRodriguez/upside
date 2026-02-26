"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

function formatTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function NotificationPopover() {
  const [open, setOpen] = React.useState(false);
  const { data: list, refetch: refetchList } = api.notification.list.useQuery(
    { limit: 10 },
    { enabled: open },
  );
  const { data: unread, refetch: refetchUnread } =
    api.notification.getUnreadCount.useQuery(undefined, {
      enabled: !open,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    });
  const markRead = api.notification.markRead.useMutation({
    onSuccess: () => {
      refetchList();
      refetchUnread();
    },
  });
  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => {
      refetchList();
      refetchUnread();
    },
  });

  const unreadCount = unread?.count ?? 0;
  const items = list?.items ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Notifications"
                    className="relative"
                  >
                    <HugeiconsIcon icon={Notification01Icon} strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Button>
                }
              />
            }
          />
          <TooltipContent side="bottom">Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent align="end" side="bottom" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.link ?? "/notifications"}
                    onClick={() => {
                      if (!n.readAt) markRead.mutate({ id: n.id });
                      setOpen(false);
                    }}
                    className={cn(
                      "block px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
                      !n.readAt && "bg-muted/30",
                    )}
                  >
                    <div className="font-medium leading-tight">{n.title}</div>
                    {n.body && (
                      <div className="mt-0.5 line-clamp-2 text-muted-foreground">
                        {n.body}
                      </div>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatTime(n.createdAt)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t px-3 py-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
