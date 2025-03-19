"use client";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import UploadThing from "../upload-thing";
import { useAuth } from "~/hooks/useAuth";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [subcategory, setSubCategory] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const { isAuthenticated, userId, jwtUser, nextAuthSession } = useAuth();
  const { mutateAsync } = api.products.createProduct.useMutation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (jwtUser || nextAuthSession?.user) {
      setAuthChecked(true);
    }
  }, [jwtUser, nextAuthSession]);

  const router = useRouter();

  const categoryOptions: Record<string, string[]> = {
    Technic: ["Notebook", "Computers", "Game Consoles"],
    Music: ["Guitars", "Pianos", "Drums"],
    "Beauty and Fashion": ["Makeup", "Skincare", "Hair Products"],
    "Children's Products": ["Toys", "Clothing", "Accessories"],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!isAuthenticated) {
      console.error("User is not authenticated.");
      return;
    }
  
    try {
      const createdById = jwtUser?.id || nextAuthSession?.user?.id;
  
      if (!createdById) {
        console.error("User ID not found");
        return;
      }
  
      console.log("Creating product with user:", { jwtUser, nextAuthSession });
  
      await mutateAsync({
        name,
        imageUrls,
        desc,
        price: parseFloat(price.toString()),
        category,
        subcategory,
        url: imageUrls[0] || "",
        createdById,
      });
      
      router.push("/");
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setSubCategory("");
  };

  const handleSubCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubCategory(e.target.value);
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
          <label className="block mb-2">Category</label>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded bg-white"
            required
          >
            <option value="" disabled>Select a category</option>
            <option value="Technic">Technic</option>
            <option value="Music">Music</option>
            <option value="Beauty and Fashion">Beauty and Fashion</option>
            <option value="Children's Products">Children's Products</option>
          </select>
        </div>

        {category && (
          <div className="mb-4">
            <label className="block mb-2">Choose a Subcategory</label>
            <select
              value={subcategory}
              onChange={handleSubCategoryChange}
              className="w-full p-2 border border-gray-300 rounded bg-white"
              required
            >
              <option value="" disabled>Select a subcategory</option>

              {categoryOptions[category]?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

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
