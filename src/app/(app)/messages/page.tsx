"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { useOrg } from "@/contexts/org-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HugeiconsIcon,
} from "@hugeicons/react";
import { MessageText01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

function formatMessageTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString();
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationIdParam = searchParams.get("conversation");
  const conversationId = conversationIdParam ? Number(conversationIdParam) : null;

  const { activeOrgId } = useOrg();
  const [newMessageOpen, setNewMessageOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(null);
  const [messageBody, setMessageBody] = React.useState("");

  const { data: conversations, isLoading: conversationsLoading } =
    api.message.listConversations.useQuery();
  const { data: conversation, isLoading: conversationLoading } =
    api.message.getConversation.useQuery(
      { conversationId: conversationId!, limit: 50 },
      { enabled: conversationId != null },
    );
  const getMessageableUsers = api.message.getMessageableUsers.useQuery(
    { orgId: activeOrgId ?? undefined },
    { enabled: newMessageOpen },
  );
  const getOrCreateConversation = api.message.getOrCreateDirectConversation.useMutation({
    onSuccess: (data) => {
      setNewMessageOpen(false);
      setSelectedUserId(null);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?conversation=${data.conversationId}`,
      );
    },
  });
  const sendMessage = api.message.sendMessage.useMutation({
    onSuccess: () => {
      setMessageBody("");
      void utils.message.getConversation.invalidate();
      void utils.message.listConversations.invalidate();
    },
  });
  const utils = api.useUtils();

  const handleStartConversation = () => {
    if (selectedUserId == null) return;
    getOrCreateConversation.mutate({ otherUserId: selectedUserId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId || !messageBody.trim()) return;
    sendMessage.mutate({ conversationId, body: messageBody.trim() });
  };

  const messageableUsers = getMessageableUsers.data ?? [];

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 flex-col gap-4 md:flex-row">
      {/* Conversation list */}
      <aside className="flex w-full shrink-0 flex-col gap-2 md:w-72 md:border-r md:pr-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Messages</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewMessageOpen(true)}
          >
            <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} className="mr-1 size-4" />
            New
          </Button>
        </div>
        {conversationsLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : !conversations?.length ? (
          <p className="py-4 text-sm text-muted-foreground">
            No conversations yet. Start one with &quot;New&quot;.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 overflow-y-auto">
            {conversations.map((c) => {
              const other = c.otherParticipants[0];
              const name = other?.name ?? "Unknown";
              const isActive = c.id === conversationId;
              return (
                <li key={c.id}>
                  <a
                    href={`/messages?conversation=${c.id}`}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isActive && "bg-muted font-medium",
                    )}
                  >
                    <div className="font-medium">{name}</div>
                    {c.lastMessage && (
                      <div className="truncate text-xs text-muted-foreground">
                        {c.lastMessage.senderName}: {c.lastMessage.body.slice(0, 40)}
                        {c.lastMessage.body.length > 40 ? "…" : ""}
                      </div>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Thread */}
      <main className="flex min-h-0 flex-1 flex-col rounded-lg border">
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a conversation or start a new one
          </div>
        ) : conversationLoading ? (
          <div className="flex flex-1 flex-col gap-2 p-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-3/4" />
          </div>
        ) : !conversation ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Conversation not found
          </div>
        ) : (
          <>
            <div className="border-b px-4 py-2">
              <p className="font-medium">
                {conversation.otherParticipants.map((p) => p.name).join(", ")}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-3">
                {conversation.messages.map((msg) => {
                  const isMe = !conversation.otherParticipants.some(
                    (p) => p.id === msg.senderId,
                  );
                  const senderName = msg.sender?.name ?? "You";
                  return (
                    <li
                      key={msg.id}
                      className={cn(
                        "flex flex-col",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted",
                        )}
                      >
                        {!isMe && (
                          <div className="mb-0.5 text-xs font-medium opacity-80">
                            {senderName}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap wrap-break-word">{msg.body}</p>
                        <div
                          className={cn(
                            "mt-1 text-xs opacity-70",
                            isMe ? "text-right" : "text-left",
                          )}
                        >
                          {formatMessageTime(msg.createdAt)}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <form
              onSubmit={handleSendMessage}
              className="flex gap-2 border-t p-4"
            >
              <Input
                placeholder="Type a message…"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                disabled={sendMessage.isPending}
                className="flex-1"
              />
              <Button type="submit" disabled={!messageBody.trim() || sendMessage.isPending}>
                Send
              </Button>
            </form>
          </>
        )}
      </main>

      {/* New message dialog */}
      <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Start a conversation with a member of your organization.
          </p>
          {getMessageableUsers.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : messageableUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No other members in your organization to message. Switch to an
              organization to message teammates.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto rounded-lg border">
              {messageableUsers.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(u.id)}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      selectedUserId === u.id && "bg-muted",
                    )}
                  >
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNewMessageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartConversation}
              disabled={selectedUserId == null || getOrCreateConversation.isPending}
            >
              Start conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
