import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Custom 404 Not Found page.
 * Required to fix a Next.js 14 Windows build bug where the auto-generated
 * _not-found page fails to produce its .nft.json trace file, crashing the
 * "Collecting build traces" step even after all pages compile successfully.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-7xl font-serif font-bold text-brand-accent mb-4">404</p>
        <h1 className="font-serif text-2xl font-bold text-brand-text mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-brand-darkGray mb-8 max-w-sm">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-brand-accent text-white text-xs px-8 py-3 rounded-full font-semibold uppercase tracking-widest hover:bg-brand-primary transition-colors"
        >
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
