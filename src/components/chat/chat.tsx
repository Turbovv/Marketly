"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import io from "socket.io-client";
import { formatDate } from "~/lib/format";
import { useRouter } from "next/navigation";
import DeleteConversationButton from "./delete-chat";
import { useAuth } from "~/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

export default function Chat({
  conversationId,
  currentUserId,
}: {
  conversationId: number;
  currentUserId: string;
}) {
  const { authUser, isAuthenticated } = useAuth();
  const userName = authUser?.name ?? "Unknown User";

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<
    {
      id: number | string;
      content: string;
      senderId: string;
      senderName: string | null;
      createdAt: string;
    }[]
  >([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [socket, setSocket] = useState<any>(null);

  const { data: chatMessages, refetch } = api.chat.getMessages.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );
  const { data: conversation } = api.chat.getConversation.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );

  const SellerName = conversation
    ? currentUserId === conversation.sellerId
      ? conversation.buyerName
      : conversation.sellerName
    : "Chat";


  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    newSocket.emit("joinRoom", conversationId);

    newSocket.on("newMessage", (newMessage) => {
      setAllMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        return exists ? prev : [...prev, newMessage];
      });
    });

    newSocket.on("conversationDeleted", (data) => {
      if (data.conversationId === conversationId) {
        alert("This conversation has been deleted.");
        router.push("/chat");
        router.refresh()
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId, router]);

  useEffect(() => {
    if (chatMessages) {
      setAllMessages(chatMessages.map((msg) => ({ ...msg, createdAt: msg.createdAt.toString() })));
    }
  }, [chatMessages]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [allMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({ conversationId, content: message });

    if (socket) {
      socket.emit("sendMessage", {
        conversationId,
        content: message,
        senderId: currentUserId,
        senderName: userName,
        createdAt: new Date().toISOString(),
        id: `temp-${crypto.randomUUID()}`,
      });
    }

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-6 py-3 border-b">
        <button
            onClick={() => router.push("/chat")}
            className="lg:hidden text-sm flex items-center gap-1 text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        <h2 className="text-lg font-semibold">
          {SellerName}
        </h2>
        <DeleteConversationButton conversationId={conversationId} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-white" ref={messageContainerRef}>
        {allMessages.map((msg, idx) => (
          <div key={`${msg.id}-${idx}`} className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.senderId === currentUserId ? "bg-[#f1f5f9] text-black rounded-br-none" : "bg-white border text-gray-900 rounded-bl-none"
              }`}
            >
              <p className="mb-1 font-medium">{msg.senderName}</p>
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">{formatDate(new Date(msg.createdAt))}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t bg-white px-6 py-4 flex items-center gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} className="bg-yellow-400 text-white px-5 py-2 rounded-lg hover:bg-yellow-500 transition">
          Send
        </button>
      </div>
    </div>
  );
}
