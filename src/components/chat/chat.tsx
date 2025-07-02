"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "~/trpc/react";
import io from "socket.io-client";
import { formatDate } from "~/lib/format";
import { useRouter } from "next/navigation";
import DeleteConversationButton from "./delete-chat";
import { useAuth } from "~/hooks/useAuth";
import { ArrowLeft } from "lucide-react";

type Message = {
  id: number | string;
  content: string;
  senderId: string;
  senderName: string | null;
  createdAt: string;
  conversationId?: number;
};

export default function Chat({
  conversationId,
  currentUserId,
}: {
  conversationId: number;
  currentUserId: string;
}) {
  const { authUser, isAuthenticated } = useAuth();
  const userName = authUser?.name ?? "Unknown User";
  const router = useRouter();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const { data: chatMessages } = api.chat.getMessages.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );

  const { data: conversation } = api.chat.getConversation.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
    },
  });

  const SellerName = conversation
    ? currentUserId === conversation.sellerId
      ? conversation.buyerName
      : conversation.sellerName
    : "Chat";

  const connectSocket = useCallback(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      newSocket.emit("joinRoom", conversationId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on("newMessage", (newMessage: Message) => {
      setAllMessages(prev => {
        if (prev.some(msg => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    newSocket.on("conversationDeleted", (data) => {
      if (data.conversationId === conversationId) {
        alert("This conversation has been deleted.");
        router.push("/chat");
        router.refresh();
      }
    });

    socketRef.current = newSocket;

    return () => newSocket.disconnect();
  }, [conversationId, router]);

  useEffect(() => {
    const cleanup = connectSocket();
    return () => {
      cleanup();
      socketRef.current?.disconnect();
    };
  }, [connectSocket]);

  useEffect(() => {
    if (chatMessages) {
      setAllMessages(chatMessages.map(msg => ({ 
        ...msg, 
        createdAt: msg.createdAt.toString() 
      })));
    }
  }, [chatMessages]);

  useEffect(() => {
    const scrollToBottom = () => {
      const element = messageContainerRef.current;
      if (!element) return;
      
      element.scrollTop = element.scrollHeight;
    };

    scrollToBottom();

    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !isConnected) return;

    const messageData: Message = {
      id: `temp-${Date.now()}`,
      content: message.trim(),
        senderId: currentUserId,
        senderName: userName,
        createdAt: new Date().toISOString(),
      conversationId,
    };

    setAllMessages(prev => [...prev, messageData]);
    setMessage("");
    
    messageContainerRef.current?.scrollTo({
      top: messageContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });

    socketRef.current?.emit("sendMessage", messageData);
    
    try {
      await sendMessageMutation.mutateAsync({ 
        conversationId, 
        content: messageData.content 
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setAllMessages(prev => prev.filter(msg => msg.id !== messageData.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

const sortedMessages = [...allMessages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

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
       {sortedMessages.map((msg, idx) => (
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
          onKeyPress={handleKeyPress}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Type your message..."
        />
        <button 
          onClick={() => void handleSendMessage()} 
          disabled={!isConnected}
          className={`px-5 py-2 rounded-lg transition
            ${isConnected 
              ? 'bg-yellow-400 text-white hover:bg-yellow-500' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Send
        </button>
      </div>
    </div>
  );
}
