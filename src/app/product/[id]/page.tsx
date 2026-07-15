import React, { cache } from "react";
import { Metadata } from "next";
import { dbConnect, ProductModel } from "@/lib/mongodb";
import ProductDetailClient from "./ProductDetailClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Cached database query for single request deduplication.
 * Prevents multiple queries between generateMetadata and ProductDetailPage.
 */
const getProduct = cache(async (id: string) => {
  await dbConnect();
  // Select fields and execute query using lean() for maximum performance
  return ProductModel.findOne({ id }).lean();
});

/**
 * Server-side dynamic SEO metadata generation.
 * Enables Google and other search engines to crawl product titles, descriptions, and previews.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);
    
    if (!product) {
      return {
        title: "Product Not Found | Sanaya Collection",
        description: "The requested ethnic wear product could not be found."
      };
    }

    return {
      title: `${product.name} | Sanaya Collection`,
      description: `${product.description} Sizing: ${product.sizes.join(", ")}. Fabric: ${product.fabric}. Shop premium Pakistani suits and Indian kurtas.`,
      keywords: `${product.name}, ${product.category}, ${product.fabric}, Pakistani Suits, Indian Kurtas, Sanaya Collection`,
      openGraph: {
        title: `${product.name} | Sanaya Collection`,
        description: product.description,
        images: [
          {
            url: product.images[0] || "/logo.png",
            width: 800,
            height: 1000,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Luxury Ethnic Wear | Sanaya Collection"
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  try {
    const resolvedParams = await params;
    const product = await getProduct(resolvedParams.id);
    
    if (!product) {
      return (
        <div className="min-h-screen flex flex-col justify-between bg-brand-bg">
          <Navbar />
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <h2 className="font-serif text-2xl font-bold text-brand-text">Product Not Found</h2>
            <p className="text-xs text-brand-darkGray mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
            <a
              href="/"
              className="bg-brand-accent text-white text-xs px-6 py-3 rounded-full font-semibold uppercase tracking-widest"
            >
              Back to Home
            </a>
          </div>
          <Footer />
        </div>
      );
    }

    // Serialize Mongoose document safely to plain JS object for client passing
    const serializedProduct = JSON.parse(JSON.stringify(product));

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": product.description,
      "sku": product.id,
      "brand": {
        "@type": "Brand",
        "name": "Sanaya Collection"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://sanayacollection.com/product/${product.id}`,
        "priceCurrency": "INR",
        "price": product.salePrice,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    return (
      <div className="flex flex-col min-h-screen">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-grow py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ProductDetailClient product={serializedProduct} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error loading product detail page:", error);
    return (
      <div className="min-h-screen flex flex-col justify-between bg-brand-bg">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-brand-text">Server Error</h2>
          <p className="text-xs text-brand-darkGray mt-2 mb-6">An error occurred while loading this product. Please try again later.</p>
          <a
            href="/"
            className="bg-brand-accent text-white text-xs px-6 py-3 rounded-full font-semibold uppercase tracking-widest"
          >
            Back to Home
          </a>
        </div>
        <Footer />
      </div>
    );
  }
}
