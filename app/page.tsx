"use client";

import HeroSection from "@/components/hero-section";
import { HomepageModelViewer } from "@/components/homepage-model-viewer";
import Image from "next/image";
import Link from "next/link";
// import FeaturedBuilder from "@/components/featured-builder";
// import FeaturedBuild from "@/components/featured-build";
// import RecentBuilds from "@/components/recent-builds";
// import BestKit from "@/components/best-kit";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Share Your Builds Section */}
      <section className="h-[calc(100vh-4rem)] bg-gray-50  flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left Column - Content */}
            <div className="col-span-5">
              <div className="space-y-8">
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Share Your Gunpla Builds
                </h2>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Document your Gunpla journey from planning to completion.
                  Upload progress shots, share your techniques, and inspire the
                  community with your unique builds. Every builder has their own
                  story — this is where you tell yours.
                </p>

                <div className="flex gap-4">
                  <Link
                    href="/builds/new"
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    Start Your First Build
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                  <Link
                    href="/builds"
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    View Builds
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Placeholder */}
            <div className="col-span-7">
              <Image
                src="https://images.unsplash.com/photo-1577978924027-8657e5e9cfe3?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                width={1000}
                height={400}
                alt="Builds"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Customize in 3D Section */}
      <section className="h-[calc(100vh-4rem)] bg-white flex items-center">
        <div className="container mx-auto px-4 py-16 h-full flex flex-row">
          <div className="grid grid-cols-12 gap-8 items-center">
            {/* Left Column - 3D Model Viewer */}
            <div className="col-span-7 h-full">
              <div className="bg-gray-100 rounded-lg h-full overflow-hidden">
                <HomepageModelViewer
                  modelUrl="/models/sazabi.glb"
                  className="w-full h-full"
                  background="transparent"
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="col-span-5">
              <div className="space-y-8">
                <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                  Design Your Dream Gunpla
                </h2>

                <p className="text-xl text-gray-600 leading-relaxed">
                  Experiment with colors, decals, and effects in our 3D
                  configurator before you ever touch a brush. Try out different
                  themes — from classic schemes to bold, custom designs — and
                  bring your vision to life with full 360° previews.
                </p>

                <div className="flex gap-4">
                  <Link
                    href="/customize"
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    Start Customizing
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Builder */}
      {/* <FeaturedBuilder /> */}

      {/* Featured Build */}
      {/* <FeaturedBuild /> */}

      {/* Recent Builds */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Builds</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay up to date with the latest builds from our community
            </p>
          </div>
          <RecentBuilds limit={6} />
        </div>
      </section> */}

      {/* Best Kit */}
      {/* <BestKit /> */}
    </div>
  );
}
