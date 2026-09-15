"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Lock, Mail, User, ArrowRight, Store, AlertCircle, Loader2, ShieldCheck, UserPlus, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, signUp } = useApp();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      if (!email || !password) {
        setError("Please fill in both email and password fields.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await login(email, password);
        if (res.success && res.user) {
          if (res.user.role === "admin") {
            router.replace("/sc-panel-7k9m2x");
          } else {
            setError("Access denied. Your account does not have store administrator privileges.");
          }
        } else {
          setError(res.message || "Invalid email or password.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign Up — always creates a customer account.
      // Admin accounts must be provisioned directly in the database.
      if (!fullName || !email || !password) {
        setError("Please complete all registration fields.");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await signUp(fullName, email, password);
        if (res.success) {
          // New accounts are customers — redirect to the storefront, not admin
          router.replace("/");
        } else {
          setError(res.message || "Registration failed. Please try again.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to register account.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-950 rounded-3xl border border-zinc-800 p-8 sm:p-10 shadow-2xl space-y-6">
        
        {/* Header Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 mb-2">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
            Sanaya Admin Portal
          </h1>
          <p className="text-xs text-zinc-400">
            {mode === "login"
              ? "Sign in with your admin credentials to manage store operations."
              : "Create a customer account. Admin access is managed separately."}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              mode === "login"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
              mode === "signup"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UserPlus size={14} />
            <span>Register Account</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs flex items-start space-x-2 animate-fadeIn">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              {mode === "signup" ? "Email" : "Admin Email"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "signup" ? "you@example.com" : "admin@sanaya.com"}
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-rose-600/50 text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 pt-3"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{mode === "login" ? "Authenticating..." : "Creating Account..."}</span>
              </>
            ) : (
              <>
                <span>{mode === "login" ? "Sign In to Admin Panel" : "Create Account"}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle Footer Prompt */}
        <div className="text-center pt-2">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Need an account? Register here
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
            >
              Already have an admin account? Sign In
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-900 text-center">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center text-xs text-zinc-400 hover:text-white transition-colors space-x-1.5 font-medium"
          >
            <Store size={14} />
            <span>Back to Main Storefront</span>
          </button>
        </div>

      </div>
    </div>
  );
}
