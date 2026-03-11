import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Newspaper, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground mt-12 py-12 px-4">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
              <Newspaper size={18} />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic">
              Daily Post
            </span>
          </Link>
          <p className="text-sidebar-foreground/60 max-w-md text-sm leading-relaxed">
            Leading the way in digital journalism. We bring you the most
            accurate and up-to-date news from around the world. Trusted by
            millions daily.
          </p>
          <div className="flex gap-4 pt-2">
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-sidebar-accent hover:bg-primary transition-colors"
            >
              <Facebook size={18} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-sidebar-accent hover:bg-primary transition-colors"
            >
              <Youtube size={18} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-sidebar-accent hover:bg-primary transition-colors"
            >
              <Twitter size={18} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold uppercase tracking-widest text-sm border-b border-sidebar-border pb-2 inline-block">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70 font-medium">
            <li>
              <Link
                href="/category/national"
                className="hover:text-primary transition-colors"
              >
                National News
              </Link>
            </li>
            <li>
              <Link
                href="/category/sports"
                className="hover:text-primary transition-colors"
              >
                Sports Coverage
              </Link>
            </li>
            <li>
              <Link
                href="/category/politics"
                className="hover:text-primary transition-colors"
              >
                Political Analysis
              </Link>
            </li>
            <li>
              <Link
                href="/category/tech"
                className="hover:text-primary transition-colors"
              >
                Tech & Business
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold uppercase tracking-widest text-sm border-b border-sidebar-border pb-2 inline-block">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-sidebar-foreground/70 font-medium">
            <li>123 News Plaza, Dhaka</li>
            <li>Email: info@dailypost.com</li>
            <li>Phone: +880 1234 567890</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-12 pt-8 border-t border-sidebar-border text-center text-xs text-sidebar-foreground/40 font-medium uppercase tracking-widest">
        © 2026 Daily Post News Portal. All Rights Reserved.
      </div>
    </footer>
  );
}
