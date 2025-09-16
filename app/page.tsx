"use client";

import RecentBuilds from "@/components/recent-builds";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Gunpla Sekai</h1>
          <p className="text-gray-600">
            Discover, collect, and share your Gunpla builds with the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <RecentBuilds limit={6} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats or Featured Content */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h2 className="text-xl font-semibold mb-2">Start Your Journey</h2>
                <p className="text-blue-100 mb-4">
                  Join the community and start documenting your Gunpla builds
                </p>
                <a
                  href="/kits"
                  className="inline-block bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Browse Kits
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
