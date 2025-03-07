import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import io from "socket.io-client";

interface DeleteConversationButtonProps {
  conversationId: number;
}

export default function DeleteConversationButton({ conversationId }: DeleteConversationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const deleteConversationMutation = api.chat.deleteConversation.useMutation({
    onSuccess: () => router.push("/chat"),
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      setIsDeleting(true);
      try {
        await deleteConversationMutation.mutateAsync({ conversationId });
        socket?.emit("deleteConversation", conversationId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
      } finally {
        setIsDeleting(false);
        router.push("/chat")
      }
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-500 text-sm" disabled={isDeleting}>
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
