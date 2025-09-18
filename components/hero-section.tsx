"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Wrench, Users, Star } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary text-white h-[calc(100vh-4rem)]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-base px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                Dedicated to Gunpla
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Gunpla Sekai
                </span>
              </h1>

              <p className="text-2xl text-blue-100 leading-relaxed max-w-2xl">
                At Gunpla Sekai, we&apos;re dedicated to providing the ultimate Gunpla experience.
                Explore our comprehensive shop for the latest kits and tools, customize your
                builds with our 3D configurator, and share your creations with a community
                of passionate builders.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold text-lg px-8 py-4 h-auto">
                <Link href="/kits">
                  <ShoppingBag className="w-6 h-6 mr-3" />
                  Browse Kits
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white hover:text-blue-900 font-semibold text-lg px-8 py-4 h-auto">
                <Link href="/builds/new">
                  <Wrench className="w-6 h-6 mr-3" />
                  Start Building
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">500+</div>
                <div className="text-base text-blue-200">Kits Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">1.2K</div>
                <div className="text-base text-blue-200">Active Builders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-300">5K+</div>
                <div className="text-base text-blue-200">Builds Shared</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/banner.jpg"
                alt="Gunpla model kits and building tools"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">3D Configurator</div>
                  <div className="text-sm text-gray-600">Customize your builds</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Community</div>
                  <div className="text-sm text-gray-600">Share & inspire</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
