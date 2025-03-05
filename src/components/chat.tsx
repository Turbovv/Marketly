"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "~/trpc/react";
import io from "socket.io-client";
import { useSession } from "next-auth/react";
import { formatDate } from "~/lib/format";
import { useRouter } from "next/navigation";
import DeleteConversationButton from "./delete-chat";

export default function Chat({
  conversationId,
  currentUserId,
}: {
  conversationId: number;
  currentUserId: string;
}) {
  const { data: session} = useSession();
  const { data: messages, refetch } = api.chat.getMessages.useQuery(
    { conversationId },
    { refetchOnWindowFocus: true }
  );
  const router = useRouter();

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => refetch(),
  });

  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const [allMessages, setAllMessages] = useState<{
    id: number | string;
    content: string;
    senderId: string;
    senderName: string | null;
    createdAt: string;
  }[]>(messages ? messages.map(msg => ({ ...msg, createdAt: msg.createdAt.toString() })) : []);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", { reconnection: true });
    setSocket(newSocket);
    newSocket.emit("joinRoom", conversationId);

    newSocket.on("newMessage", (newMessage) => {
      console.log("New message received:", newMessage);
      setAllMessages((prev) => {
        if (!prev.find((msg) => msg.id === newMessage.id)) {
          return [...prev, newMessage];
        }
        return prev;
      });
    });

    newSocket.on("conversationDeleted", (data) => {
      if (data.conversationId === conversationId) {
        alert("This conversation has been deleted.");
        router.push("/chat");
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    if (messages && messages.length !== allMessages.length) {
      setAllMessages(messages.map(msg => ({ ...msg, createdAt: msg.createdAt.toString() })));
    }
  }, [messages]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [allMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const sentMessage = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        senderName: session?.user.name,
        content: message,
        createdAt: new Date().toISOString(),
      };

      setAllMessages((prev: any) => [...prev, sentMessage]);

      sendMessageMutation.mutate({ conversationId, content: message });

      socket.emit("sendMessage", {
        conversationId,
        content: message,
        senderId: currentUserId,
        senderName: session?.user.name,
        id: sentMessage.id,
        createdAt: sentMessage.createdAt,
      });

      setMessage("");
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-2 bg-gray-100">
      <DeleteConversationButton conversationId={conversationId} />
      <div
        className="h-60 overflow-y-auto space-y-2 p-2"
        ref={messageContainerRef}
      >
        {allMessages?.map((msg, index) => {
          const isSentByMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id ?? `msg-${index}`}
              className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  isSentByMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                <p className="text-sm font-semibold">{msg.senderName}</p>
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs ">
                  {formatDate(new Date(msg.createdAt))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-2 rounded-md"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  );
}
