"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Clock,
  Send,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard orders are dispatched within 24–48 hours. Delivery takes 3–5 business days for most Indian cities. Express shipping options are available at checkout."
  },
  {
    q: "What is your return policy?",
    a: "We offer a hassle-free 7-day return or exchange policy from the date of delivery. The item must be unused, unwashed, and with original tags attached. Reverse pickup is available in eligible pincodes."
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes! COD is available on all orders across India. Simply select 'Cash On Delivery' at checkout. An additional ₹50 COD handling fee may apply."
  },
  {
    q: "Can I customise the size of an outfit?",
    a: "We currently offer standard sizes XS to XXL. Custom stitching requests can be sent via WhatsApp. Please allow 7–10 extra business days for custom orders."
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you'll receive an SMS and email with your tracking number. You can also track your order from your account dashboard under 'My Orders'."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking via Razorpay, and Cash on Delivery."
  },
];

const CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Call / WhatsApp Us",
    value: "+91 70213 66239",
    sub: "Mon–Sat, 10 AM – 7 PM IST",
    href: "tel:+917021366239",
    color: "bg-green-50 text-green-700"
  },
  {
    icon: Mail,
    label: "Email Support",
    value: "Sanayacollection8@gmail.com",
    sub: "We reply within 24 hours",
    href: "mailto:Sanayacollection8@gmail.com",
    color: "bg-brand-primary/10 text-brand-accent"
  },
  {
    icon: MapPin,
    label: "Visit Our Studio",
    value: "102 Fashion Blvd, Santacruz West",
    sub: "Mumbai, Maharashtra — 400054",
    href: "https://www.google.com/maps/place/18%C2%B057'17.6%22N+72%C2%B050'04.4%22E/@18.954894,72.8319807,17z/data=!3m1!4b1!4m4!3m3!8m2!3d18.9548889!4d72.8345556?hl=en&entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D",
    color: "bg-orange-50 text-orange-600"
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Page Hero */}
      <section className="relative w-full h-[42vh] overflow-hidden flex items-center justify-center bg-brand-text">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img
          src="/images/contactimg.jpg"
          alt="Contact Sanaya Collection"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-60"
        />
        <div className="relative z-20 text-center text-white px-4">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs uppercase tracking-[0.3em] font-semibold text-brand-primary block mb-3"
          >
            We&apos;d Love to Hear From You
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl font-bold tracking-wide"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-3 text-sm text-white/75 max-w-md mx-auto"
          >
            Questions, custom orders, or just want to say hello? Our team is here for you.
          </motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-brand-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CONTACT_CARDS.map((card, i) => (
              <motion.a
                key={i}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-brand-primary/5 hover:shadow-lg transition-all duration-300 group flex flex-col items-center text-center"
              >
                <div className={`p-4 rounded-full ${card.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={22} />
                </div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-brand-accent mb-1">{card.label}</p>
                <p className="font-serif font-bold text-brand-text text-sm">{card.value}</p>
                <p className="text-xs text-brand-darkGray mt-1">{card.sub}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-20 bg-white border-t border-brand-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">

            {/* Left: Form */}
            <div className="lg:col-span-3">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Send a Message</span>
              <h2 className="font-serif text-3xl font-bold text-brand-text mt-2 mb-8">Get In Touch</h2>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                    <p className="text-sm text-green-700 leading-relaxed">
                      Thank you for reaching out. Our team will get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-xs text-brand-accent font-semibold hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-brand-text uppercase tracking-wider block mb-1.5">
                          Full Name <span className="text-brand-accent">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Aanya Verma"
                          className="w-full bg-brand-bg border border-brand-lightGray text-brand-text text-sm px-4 py-3 rounded-xl focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/10 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-text uppercase tracking-wider block mb-1.5">
                          Email Address <span className="text-brand-accent">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full bg-brand-bg border border-brand-lightGray text-brand-text text-sm px-4 py-3 rounded-xl focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/10 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-brand-text uppercase tracking-wider block mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full bg-brand-bg border border-brand-lightGray text-brand-text text-sm px-4 py-3 rounded-xl focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/10 transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-brand-text uppercase tracking-wider block mb-1.5">
                          Subject <span className="text-brand-accent">*</span>
                        </label>
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-brand-bg border border-brand-lightGray text-brand-text text-sm px-4 py-3 rounded-xl focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/10 transition"
                        >
                          <option value="">Select a topic...</option>
                          <option value="Order Issue">Order / Delivery Issue</option>
                          <option value="Return / Exchange">Return or Exchange</option>
                          <option value="Custom Order">Custom Size / Order Request</option>
                          <option value="Product Enquiry">Product Enquiry</option>
                          <option value="Payment Issue">Payment Issue</option>
                          <option value="Wholesale">Wholesale / Bulk Order</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-brand-text uppercase tracking-wider block mb-1.5">
                        Your Message <span className="text-brand-accent">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        className="w-full bg-brand-bg border border-brand-lightGray text-brand-text text-sm px-4 py-3 rounded-xl focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/10 transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-brand-accent hover:bg-brand-primary text-white text-xs px-10 py-4 rounded-full font-semibold uppercase tracking-widest transition-colors shadow-lg shadow-brand-accent/20 flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Info Panel */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Hours & Socials</span>
                <h2 className="font-serif text-2xl font-bold text-brand-text mt-2 mb-6">Find Us</h2>
              </div>

              {/* Business hours */}
              <div className="bg-brand-bg border border-brand-primary/5 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-brand-primary/10 rounded-full text-brand-accent">
                    <Clock size={18} />
                  </div>
                  <h4 className="font-serif font-bold text-brand-text text-sm">Business Hours</h4>
                </div>
                <ul className="space-y-2 text-xs text-brand-darkGray">
                  {[
                    ["Monday – Friday", "10:00 AM – 7:00 PM"],
                    ["Saturday", "10:00 AM – 5:00 PM"],
                    ["Sunday", "Closed"],
                  ].map(([day, time]) => (
                    <li key={day} className="flex justify-between border-b border-brand-lightGray/50 pb-2 last:border-0 last:pb-0">
                      <span className="font-medium">{day}</span>
                      <span className={time === "Closed" ? "text-red-500 font-semibold" : "font-semibold text-brand-text"}>{time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Media */}
              <div className="bg-brand-bg border border-brand-primary/5 rounded-2xl p-6">
                <h4 className="font-serif font-bold text-brand-text text-sm mb-4">Follow & DM Us</h4>
                <div className="space-y-3">
                  {[
                    { icon: Instagram, label: "@sanaya_collection786", sub: "Instagram", href: "https://www.instagram.com/sanaya_collection786", color: "text-pink-500 bg-pink-50" },
                    { icon: Facebook, label: "Sanaya Collection", sub: "Facebook Page", href: "https://facebook.com", color: "text-blue-600 bg-blue-50" },
                    { icon: MessageCircle, label: "+91 70213 66239", sub: "WhatsApp Chat", href: "https://wa.me/917021366239", color: "text-green-600 bg-green-50" },
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-brand-lightGray group"
                    >
                      <div className={`p-2 rounded-full ${social.color}`}>
                        <social.icon size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-text group-hover:text-brand-accent transition-colors">{social.label}</p>
                        <p className="text-[10px] text-brand-darkGray">{social.sub}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Map embed placeholder */}
              <div className="rounded-2xl overflow-hidden border border-brand-primary/5 shadow-sm h-48 bg-brand-bg flex items-center justify-center relative">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600"
                  alt="Mumbai location"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <a
                  href="https://www.google.com/maps/place/18%C2%B057'17.6%22N+72%C2%B050'04.4%22E/@18.954894,72.8319807,17z/data=!3m1!4b1!4m4!3m3!8m2!3d18.9548889!4d72.8345556?hl=en&entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noreferrer"
                  className="relative z-10 bg-brand-accent text-white text-xs px-5 py-2.5 rounded-full font-semibold uppercase tracking-wider shadow-md hover:bg-brand-primary transition-colors flex items-center space-x-2"
                >
                  <MapPin size={14} />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-brand-bg border-t border-brand-primary/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-brand-accent">Quick Answers</span>
            <h2 className="font-serif text-3xl font-bold text-brand-text mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-brand-primary/5 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <span className="font-serif font-bold text-brand-text text-sm pr-4">{faq.q}</span>
                  <div className="flex-shrink-0 p-1.5 bg-brand-bg rounded-full text-brand-accent">
                    {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs text-brand-darkGray leading-relaxed border-t border-brand-lightGray pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
