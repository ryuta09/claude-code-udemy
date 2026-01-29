"use client";

import dynamic from "next/dynamic";

// Clerk の PricingTable を動的インポート（SSR無効化）
const PricingTable = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.PricingTable),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-lg w-48 mx-auto" />
      </div>
    ),
  }
);

export function DynamicPricingTable() {
  return (
    <div className="max-w-md mx-auto">
      <PricingTable />
    </div>
  );
}
