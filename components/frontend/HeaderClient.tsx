"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NavCategory = {
  _id: string;
  name: string;
  slug: string;
};

type HeaderClientProps = {
  categories: NavCategory[];
};

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="bg-primary px-4 py-2 text-[10px] font-medium text-primary-foreground md:text-xs">
        <div className="container mx-auto flex items-center justify-between">
          <span>March 06, 2026 • Friday</span>
          <div className="flex gap-3 md:gap-4">
            <Link href="/about" className="hidden hover:underline sm:inline">
              About
            </Link>
            <Link href="/contact" className="hidden hover:underline sm:inline">
              Contact
            </Link>
            <Link href="/admin/login" className="font-bold hover:underline">
              Admin Login
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row md:gap-6 md:py-2">
        <div className="flex w-full items-center justify-between md:w-auto">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-xl font-bold text-primary-foreground transition-transform group-hover:rotate-6 md:h-10 md:w-10 md:text-2xl">
              <Newspaper size={20} />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter italic md:text-3xl">
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
            className="h-9 rounded-full border-none bg-muted/50 pl-10 focus-visible:ring-primary md:h-10"
          />
        </div>
      </div>

      <nav
        className={`border-t bg-card ${isMenuOpen ? "block" : "hidden md:block"}`}
      >
        <div className="container mx-auto px-4">
          <ul className="flex flex-col gap-2 py-4 text-sm font-bold uppercase tracking-wider md:flex-row md:items-center md:gap-6">
            <li className="border-b pb-2 text-primary md:border-0 md:pb-0">
              <Link href="/">Home</Link>
            </li>

            {categories.map((cat) => (
              <li key={cat._id} className="border-b pb-2 md:border-0 md:pb-0">
                <Link
                  href={`/category/${cat.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
