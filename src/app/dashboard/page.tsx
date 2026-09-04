"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-brand-darkGray uppercase tracking-wider font-semibold">Redirecting to Order History...</p>
      </div>
    </div>
  );
}
