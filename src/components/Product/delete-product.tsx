"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const deleteProductMutation = api.products.deleteProduct.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      router.push("/");
    },
    onError: (error) => {
      setError("Failed to delete product. Please try again.");
      console.error("Delete error:", error);
    },
  });

  const handleDelete = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await deleteProductMutation.mutateAsync({ id: productId });
    } catch (err) {
      setError("Failed to delete product. Please try again.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition flex items-center justify-center"
        >
          <Trash2 size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
