"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { MessageCircleMore, Trash2 } from "lucide-react";

export default function ProductInfo({
  product,
  userProducts,
  router,
  existingConversation,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { userId, isAuthenticated } = useAuth();

  const isOwner = userId === product?.createdById;

  const sendMessage = api.chat.sendMessage.useMutation();
  const createConversationMutation = api.chat.createConversation.useMutation();
  const deleteProductMutation = api.products.deleteProduct.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (existingConversation) {
      await sendMessage.mutateAsync({ conversationId: existingConversation.id, content: message });
      router.push(`/chat?conversationId=${existingConversation.id}`);
    } else {
      await createConversationAndSendMessage(product.createdById, message);
    }
    setIsModalOpen(false);
    setMessage("");
  };

  const createConversationAndSendMessage = async (sellerId: string, content: string) => {
    const conversation = await createConversationMutation.mutateAsync({ sellerId });

    if (conversation?.id) {
      await sendMessage.mutateAsync({ conversationId: conversation.id, content });
      router.push(`/chat?conversationId=${conversation.id}`);
    }
  };

  const handleContactSeller = () => {
    if (existingConversation && existingConversation.id) {
      router.push(`/chat?conversationId=${existingConversation.id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleDeleteProduct = () => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate({ id: product.id });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-md space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{product?.name}</h2>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-lg font-medium text-gray-800">{product?.createdBy?.name}</p>
          {userProducts && (
            <Link
              href={`/settings/${product?.createdBy?.name}`}
              className="text-blue-500 hover:underline"
            >
              <p className="text-sm text-gray-500 mt-1">
                {userProducts.length} Listing{userProducts.length > 1 ? "s" : ""}
              </p>
            </Link>
          )}
        </div>
        <div className="flex gap-4">
          {!isOwner && isAuthenticated && (
            <button
              onClick={handleContactSeller}
              className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition flex items-center justify-center"
            >
              <MessageCircleMore size={20} />
            </button>
          )}
          {isOwner && (
            <button
              onClick={handleDeleteProduct}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition flex items-center justify-center"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div className="flex justify-between items-center">
        <p className="text-lg text-gray-700">{product?.desc}</p>
        <p className="text-lg">{product.price}$</p>
      </div>

      {/* Modal for Sending Message */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-semibold mb-4">Send Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4 resize-none"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Close
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
