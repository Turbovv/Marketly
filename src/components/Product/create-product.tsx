"use client";

import React, { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { Trash2 } from "lucide-react";
import { CATEGORIES } from "~/config/categories";
import UploadThing from "./upload-thing";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubCategory] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const router = useRouter();
  const { isAuthenticated, userId } = useAuth();
  const createProduct = api.products.createProduct.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !userId || !imageUrls.length){
      return
    }
    try {
      const mainImage = imageUrls[0];
      if (!mainImage) return;

      await createProduct.mutateAsync({
        name,
        imageUrls: imageUrls.slice(1),
        desc,
        price: Number(price) || 0,
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
    setImageUrls((prev) => prev.filter((url, i) => i !== index));
  };
 const handleImageUpload = (files: Array<{ url: string }>) => {
    const newUrls = files.map((file) => file.url);
    setImageUrls((current) => [...current, ...newUrls]);
  }
  return (
    <div className="max-w-2xl p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold mb-8">Add an advertisement</h2>
      <p className="font-bold mb-4">Product details</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Title</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="0"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
            {CATEGORIES.map((cat) => (
            <SelectItem key={cat.category} value={cat.category}>
                {cat.category}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        {category && (
          <div className="space-y-2">
            <Label>Subcategory</Label>
            <Select value={subcategory} onValueChange={setSubCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subcategory" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.find((cat) => cat.category === category)?.items.map(
                  (item) => (
                <SelectItem key={item.name} value={item.name}>
                  {item.name}
                </SelectItem>
              )
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Product Images</Label>
          <UploadThing
            onUploadComplete={handleImageUpload}
            onUploadError={(error) => alert(error.message)}
          />

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {imageUrls.map((url, index) => (
              <div key={url} className="relative w-32 h-32">
                <img
                    src={url}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        <Button type="submit">Publish</Button>
        </div>
      </form>
    </div>
  );
}
