import React from "react";
import { formatDate } from "~/lib/format";
import type { Message } from "./types";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({
  messages,
  currentUserId,
  containerRef,
}: MessageListProps) {
  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white"
      ref={containerRef}
    >
      {messages.map((msg, idx) => (
        <div
          key={`${msg.id}-${idx}`}
          className={`flex ${
            msg.senderId === currentUserId ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.senderId === currentUserId
                ? "bg-[#f1f5f9] text-black rounded-br-none"
                : "bg-white border text-gray-900 rounded-bl-none"
            }`}
          >
            <p className="mb-1 font-medium">{msg.senderName}</p>
            <p>{msg.content}</p>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {formatDate(new Date(msg.createdAt))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
