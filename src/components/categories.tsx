"use client";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "~/config/categories";

export default function CategoriesContainer() {
  const router = useRouter();

  const handleClick = (category: string, name: string) => {
    router.push(`/category/${category}/${name.replace(/\s+/g, "-")}`);
  };
  const allItems = CATEGORIES.flatMap(({ category, items }) =>
    items.map(({ name, icon: Icon }) => ({ name, Icon, category }))
  );

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-6 gap-3 w-[1024px] lg:w-full">
        {allItems.map(({ name, Icon, category }) => (
            <button
              key={`${category}-${name}`}
              onClick={() => handleClick(category, name)}
              className="bg-yellow-50 rounded-xl h-32 p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <span className="text-sm group-hover:text-gray-900 transition-colors">
                {name}
              </span>
              <div className="flex justify-end w-full">
                <Icon className="w-7 h-7 text-gray-600 group-hover:text-gray-900 transition-colors" />
              </div>
            </button>
          ))
        }
      </div>
    </div>
  );
}