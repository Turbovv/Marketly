export function sortProducts(products: any[], sortOption: string): any[] {
    if (!products) return [];
  
    let sortedProducts = [...products];
  
    if (sortOption === "priceLowToHigh") {
      sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === "priceHighToLow") {
      sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
    }
  
    return sortedProducts;
  }
  