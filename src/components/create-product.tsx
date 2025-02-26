"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import UploadThing from "./upload-thing";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { mutateAsync } = api.products.createProduct.useMutation();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await mutateAsync({
        name,
        imageUrls,
        desc,
        price: parseFloat(price.toString()),
        url: imageUrls[0] || "",
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-lg mx-auto p-6 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Add a New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            rows={4}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value)))}
            className="w-full p-2 border border-gray-300 rounded appearance-none"
            required
            step="0.01"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Upload Product Image</label>
          <UploadThing
            onUploadComplete={(files) => {
              setImageUrls((prev) => [...prev, ...files.map((file) => file.url)]);
            }}
            onUploadError={(error) => alert(error.message)}
          />
        </div>

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  X
                </button>
                <img src={url} className="w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded mt-4"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
