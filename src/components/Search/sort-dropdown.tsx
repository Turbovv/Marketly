import { Dispatch, SetStateAction } from "react";

interface SortDropdownProps {
  sortOption: string;
  setSortOption: Dispatch<SetStateAction<string>>;
}

export default function SortDropdown({ sortOption, setSortOption }: SortDropdownProps) {
  return (
    <select
      onChange={(e) => setSortOption(e.target.value)}
      value={sortOption}
      className="p-2 border rounded"
    >
      <option value="none">Sort by</option>
      <option value="priceLowToHigh">Price: Low to High</option>
      <option value="priceHighToLow">Price: High to Low</option>
    </select>
  );
}
