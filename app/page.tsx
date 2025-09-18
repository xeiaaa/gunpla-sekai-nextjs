"use client";

import HeroSection from "@/components/hero-section";
import FeaturedBuilder from "@/components/featured-builder";
import FeaturedBuild from "@/components/featured-build";
import RecentBuilds from "@/components/recent-builds";
import BestKit from "@/components/best-kit";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Builder */}
      <FeaturedBuilder />

      {/* Featured Build */}
      <FeaturedBuild />

      {/* Recent Builds */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Builds</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay up to date with the latest builds from our community
            </p>
          </div>
          <RecentBuilds limit={6} />
        </div>
      </section>

      {/* Best Kit */}
      <BestKit />
    </div>
  );
}
