"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  BarChart2, 
  Package, 
  ShoppingBag, 
  Users, 
  Lock,
  Store,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useApp();

  // Route protection
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (session) {
      setIsAdmin(session.role === "admin");
    } else {
      // Allow a brief moment for hydration / session loading
      const timer = setTimeout(() => {
        setIsAdmin(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // Access Denied Page (Premium Modern Style)
  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-50 text-zinc-950 p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-200 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-full border border-rose-100">
              <Lock size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Access Denied</h1>
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-widest">Admin Credentials Required</p>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">
            Your current account does not have store administrator privileges. Please switch to an admin account or return to the main storefront.
          </p>
          <div className="flex flex-col space-y-2 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs py-3 px-4 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Sign In to Account
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-white hover:bg-zinc-50 text-zinc-950 text-xs py-3 px-4 rounded-xl font-bold uppercase tracking-wider border border-zinc-300 transition-colors shadow-sm"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-900 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">Verifying Session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Overview Stats", icon: BarChart2 },
    { href: "/admin/products", label: "Product Inventory", icon: Package },
    { href: "/admin/orders", label: "Client Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "User Registry", icon: Users },
    { href: "/admin/hero", label: "Hero Slider Images", icon: ImageIcon }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* PREMIUM LIGHT HEADER */}
      <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-50 py-4 px-6 flex justify-between items-center shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-1.5 bg-gradient-to-b from-teal-700 to-emerald-800 rounded-full shadow-xs"></div>
          <span className="font-serif text-lg font-bold tracking-wider text-zinc-900 uppercase">
            SANAYA <span className="text-xs font-sans font-semibold tracking-[0.25em] text-teal-700 ml-1">Admin</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <span className="text-zinc-500 hidden sm:inline">
            Operator: <strong className="text-zinc-800 bg-zinc-100 border border-zinc-200/60 px-2.5 py-1 rounded-md">{session?.fullName || "Admin"}</strong>
          </span>
          <button 
            onClick={() => router.push("/")}
            className="flex items-center space-x-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-xs"
          >
            <Store size={14} className="text-teal-600" />
            <span>Storefront</span>
            <ExternalLink size={12} className="text-zinc-400" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION (Minimal Light Gray style) */}
        <aside className="w-full md:w-64 bg-white border-r border-zinc-200/80 p-6 flex flex-col justify-between md:sticky md:top-[73px] md:h-[calc(100vh-73px)]">
          <div className="space-y-6">
            <div>
              <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-bold mb-4">Core Modules</p>
              <nav className="flex flex-col space-y-1.5">
                {navItems.map((item) => {
                  const NavIcon = item.icon;
                  const isSelected = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => router.push(item.href)}
                      className={`flex items-center space-x-3.5 px-4 py-3 text-xs font-semibold rounded-xl text-left transition-all duration-300 relative group ${
                        isSelected 
                          ? "bg-teal-50 text-teal-800 border-l-4 border-teal-700 shadow-xs translate-x-1" 
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      <NavIcon size={16} className={isSelected ? "text-teal-700" : "text-zinc-400 group-hover:text-teal-600 transition-colors"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-zinc-100 pt-6">
              <p className="text-[9px] tracking-[0.2em] text-zinc-400 uppercase font-bold mb-3">Operator Details</p>
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/60 space-y-2">
                <div>
                  <p className="text-xs font-bold text-zinc-800">{session?.fullName || "Admin"}</p>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">{session?.email || "admin@sanaya.com"}</p>
                </div>
                <span className="inline-flex bg-teal-50 text-teal-700 border border-teal-200/50 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {session?.role || "Admin"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-400 mt-8 pt-4 border-t border-zinc-100 font-mono">
            v1.2.0 • SSL Secured
          </div>
        </aside>

        {/* MAIN PANEL CONTENT */}
        <main className="flex-grow p-6 md:p-8 space-y-8 bg-zinc-50">
          {children}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/80 py-5 px-6 bg-white text-center text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-auto">
        &copy; {new Date().getFullYear()} Sanaya Collection | Internal Admin Dashboard
      </footer>
    </div>
  );
}
