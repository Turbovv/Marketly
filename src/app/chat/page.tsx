"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import ChatList from "~/components/chat/conversation-list";
import ChatSection from "~/components/chat/chat-section";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated, userId } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");

  const conversationId = searchParams.get("conversationId");
  const selectedId = useMemo(() => {
    return conversationId ? Number(conversationId) : null;
  }, [conversationId]);

  const { data: conversations } = api.chat.getConversations.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: searchResults, refetch } = api.chat.searchConversations.useQuery(
    { searchTerm: search },
    { enabled: !!search && isAuthenticated }
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (search.trim()) refetch();
  }, [search, refetch]);

  const currentList = useMemo(() => {
    return search.trim() ? searchResults ?? [] : conversations ?? [];
  }, [search, conversations, searchResults]);

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-xl border bg-[#f7f8fa]">
      {(!isMobile || !selectedId) && (
        <ChatList
          conversations={currentList}
          selectedId={selectedId}
          search={search}
          setSearch={setSearch}
          userId={userId ?? ""}
        />
      )}

      {(!isMobile || selectedId) && (
        <ChatSection
          selectedId={selectedId}
          userId={userId ?? ""}
        />
      )}
    </div>
  );
}
