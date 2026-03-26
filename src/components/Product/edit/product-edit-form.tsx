"use client";

import React, { useState } from "react";
import { CATEGORIES } from "~/config/categories";
import ProductImageEditor from "./product-image-editor";

interface ProductEditFormProps {
  product: {
    name: string;
    desc: string;
    price: string | number;
    category: string;
    subcategory?: string | null;
    url: string;
    imageUrls?: string[];
  };
  onCancel: () => void;
  onUpdate: (edited: {
    name: string;
    desc: string;
    price: number;
    category: string;
    subcategory?: string;
    url: string;
    imageUrls: string[];
  }) => Promise<void>;
}

export default function ProductEditForm({ product, onCancel, onUpdate }: ProductEditFormProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [desc, setDesc] = useState(product.desc);
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState(product.subcategory ?? "");
  const [images, setImages] = useState<string[]>(() => {
    const extra = (product.imageUrls ?? []).filter((u) => u !== product.url);
    return product.url ? [product.url, ...extra] : extra;
  });
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedCategory = CATEGORIES.find((c) => c.category === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);
    if (!name.trim() || !desc.trim() || isNaN(parsedPrice) || parsedPrice <= 0 || !category) {
      setError("Please fill in all required fields with valid values.");
      return;
    }
    if (images.length === 0) {
      setError("Please keep at least one photo.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await onUpdate({
        name: name.trim(),
        desc: desc.trim(),
        price: parsedPrice,
        category,
        subcategory: subcategory || undefined,
        url: images[0]!,
        imageUrls: images.slice(1),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01"
          step="0.01"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
          }}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && selectedCategory.items.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            {selectedCategory.items.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <ProductImageEditor
        images={images}
        onImagesChange={setImages}
        uploadError={uploadError}
        onUploadErrorChange={setUploadError}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="border px-4 py-2 rounded text-sm hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
