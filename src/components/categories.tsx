"use client";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const categoryOptions: Record<string, string[]> = {
  Technic: ["Notebook", "Computers", "Game Consoles"],
  Music: ["Guitars", "Pianos", "Drums"],
  "Beauty and Fashion": ["Makeup", "Skincare", "Hair Products"],
  "Children's Products": ["Toys", "Clothing", "Accessories"],
};

export default function CategoriesContainer() {
  const router = useRouter();
  const { data: categories, isLoading } = api.products.getCategories.useQuery();

  if (isLoading) return <p>Loading categories...</p>;

  return (
    <div className="categories-container p-4">
      {Object.entries(categoryOptions).map(([category, subcategories]) => {
        const hasProducts = categories?.includes(category);

        return (
          <div key={category} className="category mb-6">
            {hasProducts ? (
              <div className="subcategories mt-2">
                {subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => {
                      const formattedSubcategory = subcategory.replace(/\s+/g, "-");
                      router.push(`/category/${category}/${formattedSubcategory}`);
                    }}
                    className="subcategory-item text-blue-600 hover:underline"
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No products available in this category.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
