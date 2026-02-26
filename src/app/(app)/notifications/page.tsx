"use client";

import * as React from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function NotificationsPage() {
  const { data, isLoading } = api.notification.list.useQuery({ limit: 50 });
  const markRead = api.notification.markRead.useMutation();
  const markAllRead = api.notification.markAllRead.useMutation();
  const utils = api.useUtils();

  const handleMarkRead = (id: number) => {
    markRead.mutate(
      { id },
      {
        onSuccess: () => {
          void utils.notification.list.invalidate();
          void utils.notification.getUnreadCount.invalidate();
        },
      },
    );
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => {
        void utils.notification.list.invalidate();
        void utils.notification.getUnreadCount.invalidate();
      },
    });
  };

  const items = data?.items ?? [];
  const unreadCount = items.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <ul className="divide-y rounded-lg border">
          {[1, 2, 3].map((i) => (
            <li key={i} className="p-4">
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-24" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
          <p>No notifications yet.</p>
          <p className="mt-1 text-sm">
            When you get notifications, they’ll show up here.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((n) => (
            <li
              key={n.id}
              className={`transition-colors ${!n.readAt ? "bg-muted/30" : ""}`}
            >
              <Link
                href={n.link ?? "/notifications"}
                onClick={() => !n.readAt && handleMarkRead(n.id)}
                className="block p-4 hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">{n.title}</p>
                    {n.body && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {n.body}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.readAt && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
