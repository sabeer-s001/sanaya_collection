import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sanaya Collection | Premium Shalwar Kameez, Kurtis & Luxury Ethnic Wear",
  description: "Shop the finest luxury Shalwar Kameez, Kurtis, Bridal Wear, Party Wear, and Casuals online. Experience premium fabrics and elegance crafted for every woman with fast shipping across India.",
  keywords: "Shalwar Kameez, Kurtis, Bridal Wear, Party Wear, Casuals, Ethnic Wear, Women's Fashion India, Sanaya Collection",
  metadataBase: new URL("https://sanayacollection.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sanayacollection.com",
    title: "Sanaya Collection | Premium Shalwar Kameez, Kurtis & Luxury Ethnic Wear",
    description: "Shop the finest luxury Shalwar Kameez, Kurtis, Bridal Wear, Party Wear, and Casuals online. Experience premium fabrics and elegance crafted for every woman.",
    siteName: "Sanaya Collection",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Sanaya Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanaya Collection | Premium Shalwar Kameez, Kurtis & Luxury Ethnic Wear",
    description: "Shop the finest luxury Shalwar Kameez, Kurtis, Bridal Wear, Party Wear, and Casuals online.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${cormorant.variable} ${outfit.variable} scroll-smooth`}>
      <body className="font-sans bg-brand-bg text-brand-text min-h-screen flex flex-col overflow-x-hidden max-w-full">
        <AppProvider>
          {children}
          <WhatsAppWidget />
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="afterInteractive"
          />
        </AppProvider>
      </body>
    </html>
  );
}
