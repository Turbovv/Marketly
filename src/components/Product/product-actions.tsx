"use client";
import React, { useState } from "react";
import DeleteProductButton from "./delete-product";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";

export default function ProductActions({
  product,
  addToCartMutation,
  existingConversation,
  router,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { userId, jwtUser, nextAuthSession, isAuthenticated } = useAuth();

  const isOwner = userId === product?.createdById ||
    nextAuthSession?.user?.id === product?.createdById ||
    jwtUser?.id === product?.createdById;

  const sendMessage = api.chat.sendMessage.useMutation();
  const createConversationMutation = api.chat.createConversation.useMutation();

  if (!isAuthenticated || !userId) {
    return null;
  }

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
    if (existingConversation) {
      router.push(`/chat?conversationId=${existingConversation.id}`);
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex gap-6 mt-6">
      <div className="w-full flex flex-col gap-4">
        {isOwner && product && <DeleteProductButton productId={product.id} />}
        {!isOwner && (
          <>
            <button
              onClick={() => product && addToCartMutation.mutate({ productId: product.id, quantity: 1 })}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition ease-in-out duration-200 w-full"
            >
              Add to Cart
            </button>
            <button
              onClick={handleContactSeller}
              className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition ease-in-out duration-200 w-full"
            >
              Contact Seller
            </button>

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
          </>
        )}
      </div>
    </div>
  );
}
