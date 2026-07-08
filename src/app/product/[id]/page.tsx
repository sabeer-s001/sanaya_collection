import React from "react";
import { Metadata } from "next";
import { dbConnect, ProductModel } from "@/lib/mongodb";
import ProductDetailClient from "./ProductDetailClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  params: {
    id: string;
  };
}

/**
 * Server-side dynamic SEO metadata generation.
 * Enables Google and other search engines to crawl product titles, descriptions, and previews.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    await dbConnect();
    const product = await ProductModel.findOne({ id: params.id }).lean();
    
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
    await dbConnect();
    
    // Fetch product details
    const product = await ProductModel.findOne({ id: params.id }).lean();
    
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

    // Fetch related products
    const relatedProducts = await ProductModel.find({
      category: product.category,
      id: { $ne: product.id }
    })
      .limit(4)
      .lean();

    // Serialize Mongoose documents safely to plain JS objects for client passing
    const serializedProduct = JSON.parse(JSON.stringify(product));
    const serializedRelatedProducts = JSON.parse(JSON.stringify(relatedProducts));

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
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetailClient 
          product={serializedProduct} 
          relatedProducts={serializedRelatedProducts} 
        />
      </>
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
