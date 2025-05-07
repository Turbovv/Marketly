"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import UploadThing from "./upload-thing";
import { useAuth } from "~/hooks/useAuth";
import {
  Laptop,
  Monitor,
  Gamepad,
  Guitar,
  Piano,
  Drum,
  Paintbrush,
  Smile,
  Scissors,
  Puzzle,
  Shirt,
  Package,
  Trash2,
} from "lucide-react";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubCategory] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const { isAuthenticated, userId } = useAuth();
  const { mutateAsync } = api.products.createProduct.useMutation();
  const router = useRouter();

  const categories = [
    {
      category: "Technic",
      items: [
        { name: "Laptops", icon: Laptop },
        { name: "Computers", icon: Monitor },
        { name: "Game Consoles", icon: Gamepad },
      ],
    },
    {
      category: "Music",
      items: [
        { name: "Guitars", icon: Guitar },
        { name: "Pianos", icon: Piano },
        { name: "Drums", icon: Drum },
      ],
    },
    {
      category: "Beauty and Fashion",
      items: [
        { name: "Makeup", icon: Paintbrush },
        { name: "Skincare", icon: Smile },
        { name: "Hair Products", icon: Scissors },
      ],
    },
    {
      category: "Children's Products",
      items: [
        { name: "Toys", icon: Puzzle },
        { name: "Clothing", icon: Shirt },
        { name: "Accessories", icon: Package },
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !imageUrls.length)
      return;
    try {
      if (!userId) return;

      const mainImage: any = imageUrls[0];
      const additionalImages = imageUrls.length > 1 ? imageUrls.slice(1) : null;
      await mutateAsync({
        name,
        imageUrls: additionalImages,
        desc,
        price: price ? parseFloat(price) : 0,
        category,
        subcategory,
        url: mainImage,
        createdById: userId,
      });
      router.push("/");
      router.refresh()
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl  p-8 bg-white shadow-lg rounded-lg border border-gray-200">
      <h2 className="text-3xl font-semibold mb-8 text-gray-800">Add an advertisement</h2>
      <p className="font-bold mb-4">Product details</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700  mb-1">Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => {
              const newValue = e.target.value.replace(/\D/g, "");
              setPrice(newValue);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none 
             appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 font-medium mb-1">Choose/type Category *</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubCategory("");
            }}
            className="w-full p-3 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
            <option key={cat.category} value={cat.category}>
                {cat.category}
              </option>
            ))}
          </select>
        </div>

        {category && (
          <div>
            <label className="block text-sm text-gray-700 font-medium mb-1">Subcategory</label>
            <select
              value={subcategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="" disabled>Select a subcategory</option>
              {categories
                .find((cat) => cat.category === category)
                ?.items.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-700 font-medium mb-2">Upload Product Images</label>
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
              <div key={index} className="relative w-32 h-32">
                <img src={url} className="w-full h-full object-cover rounded-lg border border-gray-300" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex  justify-between">
          <button className="p-3 text-sm">
            Cancel
          </button>
        <button
          type="submit"
          className="bg-yellow-400 text-sm text-white font-medium p-3 rounded-lg hover:bg-yellow-500 transition"
        >
          Publish
        </button>
        </div>
      </form>
    </div>
  );
}
