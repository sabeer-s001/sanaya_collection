"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Instagram, 
  Facebook, 
  MessageCircle, // Representing WhatsApp
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CreditCard,
  Truck
} from "lucide-react";

export default function Footer() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/?category=${encodeURIComponent(category)}`);
  };

  return (
    <footer id="footer" className="bg-brand-text text-white pt-16 pb-8 font-sans border-t border-brand-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top badges banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10 mb-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-white/5 rounded-full text-brand-primary">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider">PAN INDIA SHIPPING</h4>
              <p className="text-xs text-white/60 mt-1">Dispatched within 24-48 hours. Free shipping above ₹1999.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-white/5 rounded-full text-brand-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider">100% SECURE CHECKOUT</h4>
              <p className="text-xs text-white/60 mt-1">Transactions protected with standard Razorpay and UPI encryption.</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="p-3 bg-white/5 rounded-full text-brand-primary">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wider">HASSLE-FREE RETURNS</h4>
              <p className="text-xs text-white/60 mt-1">Easy 7-day return policy with simple home reverse pickups.</p>
            </div>
          </div>
        </div>

        {/* 4-column footer links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12">
          
          {/* Column 1 - Brand description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Sanaya Collection"
                className="h-10 w-10 object-contain brightness-0 invert hover:opacity-80 transition-opacity duration-300 rounded"
              />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed pt-2">
              Sanaya Collection is a luxury fashion label dedicated to crafting premium Pakistani suits, kurtas, and traditional Indian ethnic wear for the modern woman. We combine heritage embroidery with contemporary cuts.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-4 justify-center sm:justify-start">
              <a 
                href="https://www.instagram.com/sanaya_collection786" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="https://wa.me/917021366239" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/5 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-primary uppercase border-b border-white/10 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("Shalwar Kameez")} className="hover:text-brand-primary transition-colors">Shalwar Kameez</button>
              </li>
              <li>
                <button onClick={() => handleCategoryClick("Kurtis")} className="hover:text-brand-primary transition-colors">Kurtis</button>
              </li>
              <li>
                <Link href="/?filter=best-sellers" className="hover:text-brand-primary transition-colors">Best Sellers</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-primary transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Customer Service */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-primary uppercase border-b border-white/10 pb-2">
              Customer Support
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <span className="cursor-pointer hover:text-brand-primary transition-colors">Shipping Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand-primary transition-colors">Return & Exchange Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand-primary transition-colors">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand-primary transition-colors">Terms of Service</span>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-primary transition-colors font-medium text-brand-primary/90">Staff Portal (Admin)</Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-brand-primary uppercase border-b border-white/10 pb-2">
              Contact Us
            </h4>
            <ul className="space-y-3 text-xs text-white/60">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 text-brand-primary flex-shrink-0 mt-0.5" />
                <a 
                  href="https://www.google.com/maps/place/18%C2%B057'17.6%22N+72%C2%B050'04.4%22E/@18.954894,72.8319807,17z/data=!3m1!4b1!4m4!3m3!8m2!3d18.9548889!4d72.8345556?hl=en&entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-brand-primary transition-colors"
                >
                  Sanaya House, 102 Fashion Boulevard, Linking Road, Santacruz West, Mumbai, India - 400054
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-brand-primary flex-shrink-0" />
                <span>+91 70213 66239</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 text-brand-primary flex-shrink-0" />
                <span>Sanayacollection8@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} Sanaya Collection. All Rights Reserved. Crafted with love in India.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="hover:text-white transition-colors cursor-pointer">Security</span>
            <span className="hover:text-white transition-colors cursor-pointer">Sitemap</span>
            <span className="hover:text-white transition-colors cursor-pointer">Cookie Settings</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
