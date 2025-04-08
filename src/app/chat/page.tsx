"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import Chat from "~/components/chat";
import { useAuth } from "~/hooks/useAuth";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, userId } = useAuth();

  const conversationId = searchParams.get("conversationId");
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: conversations, isLoading: loadingConversations } = api.chat.getConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: searchResults, refetch: refetchSearch } = api.chat.searchConversations.useQuery(
    { searchTerm: search },
    { enabled: !!search && isAuthenticated }
  );

  useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(Number(conversationId));
    }
  }, [conversationId]);

  useEffect(() => {
    if (search.trim()) {
      refetchSearch();
    }
  }, [search, refetchSearch]);

  const currentList = search.trim() ? searchResults ?? [] : conversations ?? [];
  const selectedConversation = currentList.find((conv) => conv.id === selectedConversationId);

  return (
    <div className="flex h-[calc(100vh-80px)] rounded-xl border border-gray-200 bg-[#f7f8fa] overflow-hidden">
      <div className="w-[300px] flex-shrink-0 bg-white border-r">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>

        <div className="px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-220px)]">
          {currentList.length ? (
            currentList.map((conversation) => {
              const name = conversation.sellerId === userId ? conversation.buyerName : conversation.sellerName;

              return (
              <div
                key={conversation.id}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 ${selectedConversationId === conversation.id ? "border-l-4 border-yellow-500 bg-gray-50" : ""}`}
                  onClick={() => router.push(`/chat?conversationId=${conversation.id}`)}
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-sm font-medium">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{name}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm px-4 py-6 text-gray-500">No conversations yet.</p>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white relative">
        {selectedConversationId && selectedConversation ? (
          <Chat
            conversationId={selectedConversationId}
            currentUserId={userId ?? ''}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start chatting
        </div>
      )}
      </div>
    </div>
  );
}
