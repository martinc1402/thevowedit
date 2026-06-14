import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thevowedit.ph"),
  title: {
    default: "The Vow Edit - Wedding suppliers in Cebu, launching soon",
    template: "%s - The Vow Edit",
  },
  description:
    "A new Cebu wedding-supplier directory launching soon, with transparent price ranges instead of the inquire-for-a-quote runaround. Suppliers can claim a free founding listing now.",
  openGraph: {
    title: "The Vow Edit - Wedding suppliers in Cebu, launching soon",
    description:
      "Launching soon in Cebu. Wedding suppliers can claim a free founding listing before couples start searching.",
    siteName: "The Vow Edit",
    type: "website",
    locale: "en_PH",
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
      <body className="min-h-full bg-bg text-ink">{children}</body>
    </html>
  );
}
