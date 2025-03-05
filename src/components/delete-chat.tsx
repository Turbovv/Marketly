import { api } from "~/trpc/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import io from "socket.io-client";

interface DeleteConversationButtonProps {
  conversationId: number;
}

export default function DeleteConversationButton({
  conversationId,
}: DeleteConversationButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:3001");
    setSocket(socketConnection);

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  const deleteConversationMutation = api.chat.deleteConversation.useMutation({
    onSuccess: async () => {
      router.push("/chat");
    },
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this conversation?")) {
      setIsDeleting(true);
      try {
        await deleteConversationMutation.mutateAsync({ conversationId });

        if (socket) {
          socket.emit("deleteConversation", conversationId);
        }
      } catch (error) {
        console.error("Error deleting conversation:", error);
      } finally {
        setIsDeleting(false);
        window.location.href = "/chat"
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-500 text-sm"
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
