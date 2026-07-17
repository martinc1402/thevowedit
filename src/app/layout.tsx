import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  // Must match the live serving host so og:image / canonical resolve to the same
  // domain Facebook fetches (the site is served at www.thevowedit.ph).
  metadataBase: new URL("https://www.thevowedit.ph"),
  title: {
    default: "The Vow Edit - Wedding suppliers in Cebu, launching soon",
    template: "%s - The Vow Edit",
  },
  description:
    "A new Cebu wedding-supplier directory launching soon, with transparent price ranges instead of the inquire-for-a-quote runaround. Suppliers can claim a free founding listing now.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Vow Edit - Wedding suppliers in Cebu, launching soon",
    description:
      "Launching soon in Cebu. Wedding suppliers can claim a free founding listing before couples start searching.",
    url: "/",
    siteName: "The Vow Edit",
    type: "website",
    locale: "en_PH",
    // og:image is supplied automatically by src/app/opengraph-image.png
    // (Next file convention), with the absolute URL from metadataBase.
  },
  twitter: {
    // X/LinkedIn render the large image; falls back to the og:image above.
    card: "summary_large_image",
    title: "The Vow Edit - Wedding suppliers in Cebu, launching soon",
    description:
      "Launching soon in Cebu. Wedding suppliers can claim a free founding listing before couples start searching.",
  },
};

export const viewport: Viewport = {
  themeColor: "#581824",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
