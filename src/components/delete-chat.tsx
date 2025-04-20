import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { revalidatePath } from "next/cache";

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
        revalidatePath("/chat")
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-50"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete Conversation"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
