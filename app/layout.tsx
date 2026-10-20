import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cinzel, Great_Vibes, Manrope } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { CartBar } from "@/components/CartBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { ShopButton } from "@/components/ShopButton";
import { TopBar } from "@/components/TopBar";
import { floristJsonLd, websiteJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-cinzel", display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes", display: "swap", preload: false });
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.shortName} — Florist in Kozhikode | Korean Bouquets & Flower Boxes`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  icons: { icon: "/images/logo-mark.png", apple: "/images/logo-mark.png" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [{ url: "/images/products/blush-rose-blooming-box.jpg", alt: "Blush Rose Blooming Box by GLONIA" }],
  },
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bodoni.variable} ${cinzel.variable} ${greatVibes.variable} ${manrope.variable} antialiased`}
    >
      <body className="font-sans">
        <JsonLd data={floristJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <a
          href="#main"
          className="sr-only z-50 bg-ink px-4 py-3 font-caps text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <CartProvider>
          <TopBar />
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <ShopButton />
          <CartBar />
        </CartProvider>
      </body>
    </html>
  );
}
