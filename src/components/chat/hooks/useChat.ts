import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";
import { api } from "~/trpc/react";
import io from "socket.io-client";
import { useAuth } from "~/hooks/useAuth";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import type { Message } from "../types/types";

interface UseChatResult {
  messages: Message[];
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  sellerName: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => Promise<void>;
  handleKeyPress: (e: KeyboardEvent<Element>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useChat(
  conversationId: number,
  currentUserId: string
): UseChatResult {

  const { authUser, isAuthenticated } = useAuth();
  const userName = authUser?.name ?? "Unknown User";
  const router = useRouter();

  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");

  const { data: chatMessages } = api.chat.getMessages.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );

  const { data: conversation } = api.chat.getConversation.useQuery(
    { conversationId },
    { enabled: isAuthenticated }
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation();

  const sellerName = conversation
    ? currentUserId === conversation.sellerId
      ? conversation.buyerName
      : conversation.sellerName
    : "Chat";

  const socketRef = useRef<Socket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const connectSocket = useCallback(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      secure: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      newSocket.emit("joinRoom", conversationId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("newMessage", (newMessage: Message) => {
      setAllMessages((prev) => {
        if (prev.some((msg) => msg.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    newSocket.on("conversationDeleted", (data: { conversationId: number }) => {
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
      setAllMessages(
        chatMessages.map((msg) => ({
          ...msg,
          createdAt: msg.createdAt.toString(),
        }))
      );
    }
  }, [chatMessages]);


  useEffect(() => {
    setAllMessages([]);
  }, [conversationId]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const timeout = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 100);
    return () => clearTimeout(timeout);
  }, [allMessages]);

  const sendMessage = async (content: string) => {
    const text = content.trim();
    if (!text || !isConnected) return;

    const messageData: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      senderId: currentUserId,
      senderName: userName,
      createdAt: new Date().toISOString(),
      conversationId,
    };

    setAllMessages((prev) => [...prev, messageData]);
    socketRef.current?.emit("sendMessage", messageData);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId,
        content: text,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSendMessage = async () => {
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: KeyboardEvent<Element>) => {
    if ((e as any).key === "Enter" && !(e as any).shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const sortedMessages = useMemo(() => {
    return [...allMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [allMessages]);

  return {
    messages: sortedMessages,
    isConnected,
    sendMessage,
    sellerName,
    message,
    setMessage,
    handleSendMessage,
    handleKeyPress,
    containerRef,
  };
}

export type { UseChatResult };
