// ChatPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import io from "socket.io-client";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Chat from "~/components/chat";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationId = searchParams.get("conversationId");

  const { data: conversations = [], isLoading } = api.chat.getConversations.useQuery();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(conversationId ? Number(conversationId) : null);

  const { data: session } = useSession();

  const currentUserId = session?.user?.id || ""; 

  useEffect(() => {
    if (!conversationId && conversations.length > 0) {
      if (conversations[0]) {
        setSelectedConversation(conversations[0].id);
      }
      if (conversations[0]) {
        router.push(`/chat?conversationId=${conversations[0].id}`);
      }
    }
  }, [conversations, conversationId, router]);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    if (selectedConversation) {
      socket.emit("joinRoom", selectedConversation);
    }

    socket.on("newMessage", (message) => {
      console.log("New message received:", message);
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedConversation]);

  if (isLoading || !session) return <div>Loading chats...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex gap-6">
        <div className="w-1/3 border p-4">
          <h2 className="text-xl">Conversations</h2>
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  router.push(`/chat?conversationId=${conversation.id}`);
                }}
                className={`cursor-pointer p-2 ${selectedConversation === conversation.id ? "bg-blue-100" : ""}`}
              >
                <p>{conversation.sellerName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-2/3">
          {selectedConversation && (
            <Chat
              conversationId={selectedConversation}
              currentUserId={currentUserId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
