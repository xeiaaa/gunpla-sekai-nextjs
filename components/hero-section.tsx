"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Wrench, Star, Package, Users, Share2 } from "lucide-react";
import Link from "next/link";
import Galaxy from "@/components/galaxy";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden h-[calc(100vh-4rem)]">
      {/* WebGL Galaxy Background */}
      <div className="absolute inset-0 bg-white">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={0.4}
          glowIntensity={0.05}
          saturation={0.5}
          hueShift={100}
          twinkleIntensity={0.1}
          rotationSpeed={0.05}
          transparent={true}
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center justify-center z-10">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="space-y-6">
            <Badge variant="secondary" className="bg-gray-900/10 text-gray-900 border-gray-900/20 hover:bg-gray-900/20 text-base px-4 py-2 backdrop-blur-sm">
              <Star className="w-4 h-4 mr-2" />
              Dedicated to Gunpla
            </Badge>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900 drop-shadow-lg">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Gunpla Sekai
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              At Gunpla Sekai, we&apos;re dedicated to providing the ultimate Gunpla experience.
              Explore our comprehensive shop for the latest kits and tools, customize your
              builds with our 3D configurator, and share your creations with a community
              of passionate builders.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800 font-semibold text-lg px-8 py-4 h-auto shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <Link href="/kits">
                <ShoppingBag className="w-6 h-6 mr-3" />
                Browse Kits
              </Link>
            </Button>

            <Button asChild size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold text-lg px-8 py-4 h-auto shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden group">
              <Link href="/builds/new">
                <Wrench className="w-6 h-6 mr-3" />
                Start Building
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-900/20 max-w-2xl mx-auto backdrop-blur-sm">
            <div className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 drop-shadow-md">4000+</div>
              <div className="text-base text-gray-600">Kits Available</div>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-cyan-100 rounded-full group-hover:bg-cyan-200 transition-colors duration-300">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-cyan-600 drop-shadow-md">1.2K</div>
              <div className="text-base text-gray-600">Active Builders</div>
            </div>
            <div className="text-center group">
              <div className="flex justify-center mb-2">
                <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors duration-300">
                  <Share2 className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-700 drop-shadow-md">5K+</div>
              <div className="text-base text-gray-600">Builds Shared</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
