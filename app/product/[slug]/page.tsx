import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductSizeGuide } from "@/components/ProductSizeGuide";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getProduct, getProducts } from "@/lib/products";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${product.name} · ${site.shortName}`,
      description: product.description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return (
    <>
      <ProductDetails key={product.slug} product={product} />
      <ProductSizeGuide product={product} />
      <RelatedProducts product={product} />
    </>
  );
}
