"use client";

import Chat from "~/components/chat/chat";
import type { ChatSectionProps } from "./types";

export default function ChatSection({
  selectedId,
  userId,
}: ChatSectionProps) {

  return (
    <div className="flex-1 bg-white relative">
      {selectedId ? (
        <Chat conversationId={selectedId} currentUserId={userId} />
      ) : (
        <div className="h-full flex items-center justify-center text-gray-400 text-sm">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
}
