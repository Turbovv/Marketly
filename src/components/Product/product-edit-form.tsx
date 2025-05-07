import { useState } from "react";
import { X } from "lucide-react";
import UploadThing from "~/components/Product/upload-thing";

interface Product {
  name: string;
  price: string;
  desc: string;
  url: string;
  imageUrls: string[];
}

interface ProductEditFormProps {
  product: Product;
  onCancel: () => void;
  onUpdate: (product: Product) => void;
}

export default function ProductEditForm({ product, onCancel, onUpdate }: ProductEditFormProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [desc, setDesc] = useState(product.desc);
  const [mainImage, setMainImage] = useState(product.url);
  const [additionalImages, setAdditionalImages] = useState(product.imageUrls);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
  };

  const handleImageUpload = (files: { url: string }[]) => {
    const newUrls: any = files.map(file => file.url);
    
    if (!mainImage) {
      setMainImage(newUrls[0]);
      setAdditionalImages([...additionalImages, ...newUrls.slice(1)]);
    } else {
      setAdditionalImages([...additionalImages, ...newUrls]);
    }
  };

  const removeMainImage = () => {
    if (additionalImages.length > 0) {
      const [firstImage, ...restImages]: any = additionalImages;
      setMainImage(firstImage);
      setAdditionalImages(restImages);
    } else {
      setMainImage('');
    }
  };

  const removeAdditionalImage = (index: number) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updatedImages);
  };

  const handleSubmit = () => {
    const updatedProduct = {
      name,
      price,
      desc,
      url: mainImage,
      imageUrls: additionalImages
    };
    onUpdate(updatedProduct);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
        <input
          type="text"
          value={price}
          onChange={handlePriceChange}
          placeholder="0.00"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {mainImage && (
            <div className="relative aspect-square">
              <img
                src={mainImage}
                alt="Main"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={removeMainImage}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X size={14} />
              </button>
              <span className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                Main
              </span>
            </div>
          )}

          {additionalImages.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removeAdditionalImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          <div className="aspect-square">
            <UploadThing
              onUploadComplete={handleImageUpload}
              onUploadError={(error) => {
                console.error('Upload failed:', error);
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          className="w-full border rounded px-3 py-2 resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}