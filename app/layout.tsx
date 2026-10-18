import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Cinzel, Great_Vibes, Manrope } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { CartBar } from "@/components/CartBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
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
    default: `${site.name} — Korean bouquets & flower boxes`,
    template: `%s · ${site.shortName}`,
  },
  description: site.description,
  icons: { icon: "/images/logo.png" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [{ url: "/images/products/blush-rose-blooming-box.jpg", alt: "Blush Rose Blooming Box by GLONIA" }],
  },
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Florist",
  name: site.name,
  url: site.url,
  image: `${site.url}/images/logo.png`,
  telephone: site.phoneTel,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressCountry: site.address.country,
  },
  openingHours: `Mo-Su ${site.hours.open}-${site.hours.close}`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bodoni.variable} ${cinzel.variable} ${greatVibes.variable} ${manrope.variable} antialiased`}
    >
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
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
          <CartBar />
        </CartProvider>
      </body>
    </html>
  );
}
