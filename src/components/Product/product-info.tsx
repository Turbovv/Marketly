"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useAuth } from "~/hooks/useAuth";
import { MessageCircleMore, Pencil } from "lucide-react";
import { formatDate } from "~/lib/format";
import ProductEditForm from "./product-edit-form";
import SendMessageModal from "./SendMessageModal/sendmessage-modal";
import DeleteProductButton from "./delete-product";
import { slugify } from "~/utils/slug";

interface ProductInfoProps {
  product: any;
  userProducts?: any;
  router: any;
  existingConversation?: any;
}

export default function ProductInfo({
  product,
  userProducts,
  router,
  existingConversation,
}: ProductInfoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const { userId, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const utils = api.useContext();

  const isOwner = userId === product?.createdById;

  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      void utils.chat.getConversations.invalidate();
    }
  });;
  const createConversationMutation = api.chat.createConversation.useMutation({
    onSuccess: () => {
      void utils.chat.getConversations.invalidate();
    }
  });

  const updateProductMutation = api.products.updateProduct.useMutation({
    onSuccess: () => {
      
      setIsEditing(false);
      void utils.products.getProductId.invalidate({ id: product.id });
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


  const handleUpdateProduct = async (editedProduct: any) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        ...editedProduct,
      });
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  return (
    <div className="p-6 rounded-lg space-y-6">
      <div className="text-sm text-gray-500 space-x-1 mb-1 flex flex-wrap items-center">
        <Link href="/" className="hover:underline text-gray-500">
          Home
        </Link>
        <span>/</span>

        {product?.category && product?.subcategory && (
          <>
            <Link
              href={`/category/${slugify(product.category)}/${slugify(product.subcategory)}`}
              className="hover:underline text-gray-500"
            >
              {product.category}
            </Link>
            <span>/</span>
          </>
        )}

        {product?.subcategory && (
          <>
            <Link
              href={`/category/${slugify(product.category)}/${slugify(product.subcategory)}`}
              className="hover:underline text-gray-500"
            >
              {product.subcategory}
            </Link>
            <span>/</span>
          </>
        )}

        <span className="text-gray-700 font-medium">{product?.name}</span>
      </div>

      <div className="flex justify-between items-center">
        {isEditing ? (
          <input
            type="text"
            value={product.name}
            readOnly
            className="text-2xl font-semibold text-gray-900 border rounded px-2 py-1 w-full"
          />
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-800 break-words overflow-hidden truncate">
              {product?.name}
            </h2>
            {isOwner && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition flex-shrink-0"
              >
                <Pencil size={16} />
              </button>
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(new Date(product?.createdAt))}</p>
      </div>

      {isEditing ? (
        <ProductEditForm
          product={product}
          onCancel={() => setIsEditing(false)}
          onUpdate={handleUpdateProduct}
        />
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center break-words">
            <p className="text-lg border-b w-full mb-4">{product.price}$</p>
            <div className="w-full">
              <p className="text-lg text-gray-700">{product?.desc}</p>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-lg font-medium text-gray-800">{product?.createdBy?.name}</p>
          {userProducts && (
            <Link
              href={`/settings/${product?.createdBy?.name}`}
              className="underline"
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
          <DeleteProductButton productId={product.id} />
          )}
        </div>
      </div>

      <SendMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendMessage}
        message={message}
        setMessage={setMessage}
      />
    </div>
  );
}
