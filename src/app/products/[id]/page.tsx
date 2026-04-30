"use client";

import ProductDetails from "~/components/Product/product-details";

export default function ProductDetailsPage(props: {
  params: { id: string };
}) {
  const productId = Number(props.params.id);

  return <ProductDetails productId={productId} />;
}