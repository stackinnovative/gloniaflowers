import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductSizeGuide } from "@/components/ProductSizeGuide";
import { RelatedProducts } from "@/components/RelatedProducts";
import { JsonLd } from "@/components/JsonLd";
import { ShopClosed, ShopGate } from "@/components/ShopPause";
import { getCollection, getProduct, getProducts, priceLabel } from "@/lib/products";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getProducts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const price = priceLabel(product);
  const description = `${product.description} ${price[0].toUpperCase()}${price.slice(1)}. Order on WhatsApp for delivery in Kozhikode.`;
  return {
    title: `${product.name} | Flower Delivery Kozhikode`,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      url: `/product/${product.slug}`,
      title: `${product.name} · ${site.shortName}`,
      description,
      images: [{ url: product.image, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const collection = getCollection(product.collection);
  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/catalog" },
          ...(collection ? [{ name: collection.name, path: `/catalog?c=${collection.id}` }] : []),
          { name: product.name, path: `/product/${product.slug}` },
        ])}
      />
      {/* While the shop is paused, old product links show the pause message instead. */}
      <ShopGate paused={<ShopClosed />}>
        <ProductDetails key={product.slug} product={product} />
        <ProductSizeGuide product={product} />
        <RelatedProducts product={product} />
      </ShopGate>
    </>
  );
}
