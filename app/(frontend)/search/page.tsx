// import { useLocation } from "wouter";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/frontend/NewsCard";

export default function SearchPage() {
  // const [location] = useLocation();
  const pathname = usePathname();
  const query = new URLSearchParams(pathname.split("?")[1]).get("q") || "";

  return (
    <main className=" container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="bg-card border p-8 rounded-2xl shadow-lg space-y-6 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Search News
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              defaultValue={query}
              placeholder="Type keywords and hit enter..."
              className="pl-12 h-12 rounded-full border-2 focus-visible:ring-primary text-lg"
            />
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="font-black uppercase tracking-tighter text-2xl">
              Search Results for "{query || "..."}"
            </h2>
            <span className="text-muted-foreground text-sm font-bold uppercase">
              12 Results found
            </span>
          </div>

          <div className="space-y-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b pb-8 last:border-0">
                <NewsCard
                  title={`Found article headline containing the search term for item number ${i + 1}`}
                  category="Results"
                  time="Oct 2023"
                  horizontal
                />
                <p className="text-muted-foreground text-sm line-clamp-2 mt-4 ml-36">
                  This is a snippet of the article content that matches the
                  search keywords. It provides some context about what the
                  article is about so the user can decide if they want to click
                  on it or not.
                </p>
              </div>
            ))}
          </div>

          <Button className="w-full font-bold uppercase tracking-widest py-6">
            Load More Results
          </Button>
        </div>
      </div>
    </main>
  );
}
