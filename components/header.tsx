"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"kits" | "mobile-suits">("kits");
  const router = useRouter();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Kits", href: "/kits" },
    { name: "Builds", href: "/builds" },
    { name: "Customize", href: "/customize" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim());
      if (searchType === "kits") {
        // Preserve existing URL params for kits page
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;

        if (currentPath === "/kits" && currentSearch) {
          // We're on kits page with existing filters - preserve them
          const urlParams = new URLSearchParams(currentSearch);
          urlParams.set("search", query);
          router.push(`/kits?${urlParams.toString()}`);
        } else {
          // No existing filters or not on kits page
          router.push(`/kits?search=${query}`);
        }
      } else {
        // Mobile suits - clear all params except search
        router.push(`/mobile-suits?search=${query}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-primary"></div>
              <span className="text-xl font-bold">Gunpla Sekai</span>
            </Link>
          </div>

          {/* Search Bar - Centered */}
          <div className="hidden md:flex items-center flex-1 justify-center max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative w-full flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-r-none border-r-0 px-3 text-sm"
                  >
                    {searchType === "kits" ? "Kits" : "Mobile Suits"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSearchType("kits")}>
                    Kits
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSearchType("mobile-suits")}
                  >
                    Mobile Suits
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${
                    searchType === "kits" ? "kits" : "mobile suits"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-l-none"
                />
              </div>
            </form>
          </div>

          {/* Right Side - Navigation + User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.name}
                </Link>
              ))}
              <SignedIn>
                <Link
                  href="/me"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Profile
                </Link>
              </SignedIn>
            </nav>

            {/* User Actions */}
            <div className="flex gap-2 items-center">
              <SignedOut>
                <SignInButton>
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton>
                  <Button size="sm">Get Started</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {/* Mobile Search */}
              <div className="px-3 py-2 space-y-2">
                <form onSubmit={handleSearch} className="space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between text-sm"
                      >
                        {searchType === "kits" ? "Kits" : "Mobile Suits"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSearchType("kits")}>
                        Kits
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSearchType("mobile-suits")}
                      >
                        Mobile Suits
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={`Search ${
                        searchType === "kits" ? "kits" : "mobile suits"
                      }...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>
              </div>

              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <SignedIn>
                <Link
                  href="/me"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/collections"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Collection
                </Link>
              </SignedIn>
              <div className="pt-4 space-y-2">
                <SignedOut>
                  <SignInButton>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <div className="flex justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
