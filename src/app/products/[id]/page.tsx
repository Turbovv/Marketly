"use client";

import { use } from "react";
import ProductDetails from "~/components/Product/product-details";

export default function ProductDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(props.params);
  const productId = Number(id);

  return <ProductDetails productId={productId} />;
}