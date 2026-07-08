"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Sparkles, ShieldCheck, Truck, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const VALUES = [
  {
    icon: Heart,
    title: "Crafted With Love",
    desc: "Every stitch is placed with intention. Our artisans pour decades of heritage craft into each ensemble — from hand-guided Chikankari to machine-perfect Zari borders."
  },
  {
    icon: Sparkles,
    title: "Premium Fabrics Only",
    desc: "We source exclusively from certified mills in Lucknow, Surat, and Lahore. Pure lawn cotton, chanderi silk, georgette, and velvet — nothing synthetic, nothing compromised."
  },
  {
    icon: ShieldCheck,
    title: "Trust & Transparency",
    desc: "No hidden charges. No misleading photos. What you see is exactly what you receive. Our quality control team inspects every order before dispatch."
  },
  {
    icon: Truck,
    title: "Pan India Delivery",
    desc: "From J&K to Tamil Nadu, we ship everywhere. Orders are dispatched within 24–48 hours with real-time SMS tracking at every step."
  }
];

const TIMELINE = [
  { year: "2018", title: "Brand Founded", desc: "Sanaya Collection was born in a small atelier in Santacruz, Mumbai — with a dream to make authentic ethnic wear accessible to every woman." },
  { year: "2019", title: "First 1000 Customers", desc: "Through word of mouth and Instagram, we hit our first thousand happy customers within just 8 months of launch." },
  { year: "2021", title: "Expanded Collections", desc: "We launched our signature Pakistani Suits line and the iconic Festive Wear Collection, both of which became instant bestsellers." },
  { year: "2023", title: "Nationwide Reach", desc: "Sanaya Collection now ships to over 500 cities across India with a growing family of 50,000+ satisfied customers." },
  { year: "2024", title: "Digital Flagship Store", desc: "We launched our premium e-commerce platform to give every woman the luxury boutique shopping experience from home." },
];

const STATS = [
  { value: "50,000+", label: "Happy Customers" },
  { value: "500+", label: "Cities Delivered" },
  { value: "200+", label: "Unique Designs" },
  { value: "4.8★", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative w-full h-[55vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <img
          src="/images/aboutheroimg.jpg"
          alt="Sanaya Collection Story"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="relative z-20 text-center text-white px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em] font-semibold text-brand-primary block mb-3"
          >
            Our Story
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide leading-tight"
          >
            About Sanaya Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-sm text-white/80 max-w-xl mx-auto leading-relaxed"
          >
            A luxury fashion label born from a deep love for South Asian heritage textiles and the modern woman who wears them with pride.
          </motion.p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="bg-brand-accent py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="font-serif text-3xl sm:text-4xl font-bold">{s.value}</div>
              <div className="text-xs mt-1 text-white/80 uppercase tracking-widest font-medium">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Who We Are</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-text leading-snug">
                Luxury Ethnic Wear, <br />Crafted for the Modern Woman
              </h2>
              <p className="text-sm text-brand-darkGray leading-relaxed">
                Sanaya Collection was founded in 2018 with a singular vision — to bridge the gap between the timeless artistry of South Asian handcraft and the elegance expected by today&rsquo;s fashion-forward woman.
              </p>
              <p className="text-sm text-brand-darkGray leading-relaxed">
                We work directly with master artisans in Lucknow, Lahore, and Surat to bring you ensembles that carry the soul of a tradition spanning centuries. From delicate Lucknowi Chikankari to opulent Banarasi silk, every piece in our collection is chosen to make you feel extraordinary.
              </p>
              <p className="text-sm text-brand-darkGray leading-relaxed">
                Our brand is named after our founder&rsquo;s grandmother — <strong className="text-brand-text">Sanaya</strong> — a woman who believed that dressing beautifully was an act of self-respect and celebration. That belief lives in every piece we create.
              </p>
              <Link
                href="/?filter=best-sellers"
                className="inline-flex items-center space-x-2 bg-brand-accent hover:bg-brand-primary text-white text-xs px-7 py-3.5 rounded-full font-semibold uppercase tracking-widest transition-colors shadow-lg"
              >
                <span>Shop Our Collection</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="/images/about01.webp"
                alt="Sanaya Collection atelier"
                className="rounded-2xl w-full h-64 object-cover shadow-md"
              />
              <img
                src="/images/about02.webp"
                alt="Festive wear collection"
                className="rounded-2xl w-full h-64 object-cover shadow-md mt-8"
              />
              <img
                src="/images/about03.jpg"
                alt="Indian Kurtas"
                className="rounded-2xl w-full h-48 object-cover shadow-md -mt-4"
              />
              <img
                src="/images/about04.webp"
                alt="Premium festive wear"
                className="rounded-2xl w-full h-48 object-cover shadow-md mt-4"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white border-t border-brand-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">What We Stand For</span>
            <h2 className="font-serif text-3xl font-bold text-brand-text mt-2">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-7 bg-brand-bg border border-brand-primary/5 rounded-2xl flex flex-col items-start hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-accent mb-5">
                  <val.icon size={22} />
                </div>
                <h3 className="font-serif font-bold text-sm text-brand-text mb-2">{val.title}</h3>
                <p className="text-xs text-brand-darkGray leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey / Timeline */}
      <section className="py-20 bg-brand-bg border-t border-brand-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Our Milestones</span>
            <h2 className="font-serif text-3xl font-bold text-brand-text mt-2">The Sanaya Journey</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 sm:-translate-x-0.5 top-0 bottom-0 w-0.5 bg-brand-primary/20" />

            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`relative flex flex-col sm:flex-row gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Year badge */}
                  <div className="absolute left-6 sm:left-1/2 sm:-translate-x-1/2 -translate-y-1 w-12 h-12 bg-brand-accent rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-10 hidden sm:flex">
                    {item.year}
                  </div>

                  {/* Content card */}
                  <div className={`w-full sm:w-[calc(50%-40px)] pl-14 sm:pl-0 ${i % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:pl-10"}`}>
                    <div className="bg-white border border-brand-primary/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-xs font-bold text-brand-accent tracking-widest uppercase block mb-1 sm:hidden">{item.year}</span>
                      <h3 className="font-serif font-bold text-brand-text mb-1">{item.title}</h3>
                      <p className="text-xs text-brand-darkGray leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  {/* Spacer on other side */}
                  <div className="hidden sm:block w-[calc(50%-40px)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-brand-text py-20 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Star size={28} className="mx-auto text-brand-primary mb-4 stroke-1" />
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Wear Your Heritage with Pride
          </h2>
          <p className="text-sm text-white/60 leading-relaxed mb-8 max-w-lg mx-auto">
            Explore our curated collections and find the perfect ensemble for every occasion — from festive celebrations to everyday elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-brand-accent hover:bg-brand-primary text-white text-xs px-8 py-4 rounded-full font-semibold uppercase tracking-widest transition-colors shadow-lg"
            >
              Browse All Collections
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs px-8 py-4 rounded-full font-semibold uppercase tracking-widest transition-colors"
            >
              Get In Touch
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
