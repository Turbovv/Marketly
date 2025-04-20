"use client";

import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

interface ChatListProps {
  conversations: any[];
  selectedId: number | null;
  search: string;
  setSearch: (val: string) => void;
  userId: string;
}

export default function ChatList({
  conversations,
  selectedId,
  search,
  setSearch,
  userId,
}: ChatListProps) {
  const router = useRouter();

  return (
    <div className="w-full lg:w-[300px] bg-white border-r">
      <div className="px-6 py-4 border-b">
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
        {conversations.length ? (
          conversations.map((conversation) => {
            const name =
              conversation.sellerId === userId
                ? conversation.buyerName
                : conversation.sellerName;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100",
                  selectedId === conversation.id &&
                    "border-l-4 border-yellow-500 bg-gray-50"
                )}
                onClick={() =>
                  router.push(`/chat?conversationId=${conversation.id}`)
                }
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center text-sm font-medium">
                  {name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium">{name}</p>
              </div>
            );
          })
        ) : (
          <p className="text-sm px-4 py-6 text-gray-500">
            No conversations yet.
          </p>
        )}
      </div>
    </div>
  );
}
