"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DeleteConversationButton from "./delete-chat.tsx";
import { ArrowLeft } from "lucide-react";

import { useChat } from "./useChat.ts";
import MessageList from "./message-list";
import MessageInput from "./message-input";

export default function Chat({
  conversationId,
  currentUserId,
}: {
  conversationId: number;
  currentUserId: string;
}) {
  const router = useRouter();

  const {
    messages,
    isConnected,
    sellerName,
    message,
    setMessage,
    handleSendMessage,
    handleKeyPress,
    containerRef,
  } = useChat(conversationId, currentUserId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-6 py-3 border-b">
        <button
          onClick={() => router.push("/chat")}
          className="lg:hidden text-sm flex items-center gap-1 text-gray-600 hover:text-black"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">{sellerName}</h2>
        <DeleteConversationButton conversationId={conversationId} />
      </div>

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        containerRef={containerRef}
      />

      <MessageInput
        message={message}
        setMessage={setMessage}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        disabled={!isConnected}
      />
    </div>
  );
}
