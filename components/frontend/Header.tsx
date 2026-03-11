"use client";

import { useState } from "react";
// import { Link } from "wouter";
import Link from "next/link";
import {
  Search,
  Menu,
  Facebook,
  Youtube,
  Twitter,
  Newspaper,
  ArrowRight,
  Clock,
  User,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      {/* Top Header */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-[10px] md:text-xs font-medium">
        <div className="container mx-auto flex justify-between items-center">
          <span>March 06, 2026 • Friday</span>
          <div className="flex gap-3 md:gap-4">
            <Link href="/about" className="hover:underline hidden sm:inline">
              About
            </Link>
            <Link href="/contact" className="hover:underline hidden sm:inline">
              Contact
            </Link>
            <Link href="/admin/login" className="hover:underline font-bold">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      {/* Logo & Search & Mobile Menu Toggle */}
      <div className="container mx-auto py-4 md:py-2 px-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="w-full flex justify-between items-center md:w-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-xl md:text-2xl group-hover:rotate-6 transition-transform">
              <Newspaper size={20} />
            </div>
            <span className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">
              Daily Post
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </Button>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news..."
            className="pl-10 rounded-full bg-muted/50 border-none focus-visible:ring-primary h-9 md:h-10"
          />
        </div>
      </div>

      {/* Nav Menu */}
      <nav
        className={`border-t bg-card ${isMenuOpen ? "block" : "hidden md:block"}`}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-4 font-bold text-sm uppercase tracking-wider">
            <li className="text-primary border-b md:border-0 pb-2 md:pb-0">
              <Link href="/">Home</Link>
            </li>
            <li className="border-b md:border-0 pb-2 md:pb-0">
              <Link
                href="/category/national"
                className="hover:text-primary transition-colors"
              >
                National
              </Link>
            </li>
            <li className="border-b md:border-0 pb-2 md:pb-0">
              <Link
                href="/category/sports"
                className="hover:text-primary transition-colors"
              >
                Sports
              </Link>
            </li>
            <li className="border-b md:border-0 pb-2 md:pb-0">
              <Link
                href="/category/politics"
                className="hover:text-primary transition-colors"
              >
                Politics
              </Link>
            </li>
            <li className="border-b md:border-0 pb-2 md:pb-0">
              <Link
                href="/category/tech"
                className="hover:text-primary transition-colors"
              >
                Technology
              </Link>
            </li>
            <li className="border-b md:border-0 pb-2 md:pb-0">
              <Link
                href="/category/entertainment"
                className="hover:text-primary transition-colors"
              >
                Entertainment
              </Link>
            </li>
            <li>
              <Link
                href="/category/world"
                className="hover:text-primary transition-colors"
              >
                World
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
