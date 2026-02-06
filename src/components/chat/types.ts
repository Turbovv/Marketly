export type Message = {
  id: number | string;
  content: string;
  senderId: string;
  senderName: string | null;
  createdAt: string;
  conversationId?: number;
};
export type ChatListProps = {
  conversations: {
    id: number;
    sellerId: string;
    buyerName: string;
    sellerName: string;
  }[];
  selectedId: number | null;
  search: string;
  setSearch: (val: string) => void;
  userId: string;
}

export type DeleteConversationButtonProps = {
  conversationId: number;
}

export type ChatSectionProps = {
  selectedId: number | null;
  userId: string;
}