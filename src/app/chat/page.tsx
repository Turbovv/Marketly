"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import Chat from "~/components/chat";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const conversationId = searchParams.get("conversationId");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const { data: conversations, isLoading, error } = api.chat.getConversations.useQuery(
    undefined,
    { enabled: !!session?.user.id }
  );

  useEffect(() => {
    if (conversationId) {
      setSelectedConversation(Number(conversationId));
    }
  }, [conversationId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading conversations: {error.message}</div>;

  return (
    <div className="container mx-auto p-6">
      {selectedConversation === null ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Conversations</h2>
          {conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex justify-between items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  router.push(`/chat?conversationId=${conversation.id}`);
                }}
              >
                <div>
                  <p className="font-bold">
                    {conversation.sellerId === session?.user.id
                      ? conversation.buyerName
                      : conversation.sellerName}
                  </p>
                  <p className="text-gray-600 text-sm">Last message: Not available</p>
                </div>
              </div>
            ))
          ) : (
            <p>No conversations yet. Start a conversation with a seller.</p>
          )}
        </div>
      ) : (
        <div>
          <h2>Conversation {selectedConversation}</h2>
          <Chat
            conversationId={selectedConversation}
            currentUserId={session?.user.id ?? ''}
          />
        </div>
      )}
    </div>
  );
}
