// import { Header, Footer, NewsCard } from "@/components/FrontendLayout";
// import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CategoryPage() {
  const { slug } = useParams();
  // const pathname = usePathname();
  const categoryName = slug?.charAt(0).toUpperCase() + slug?.slice(1);

  return (
    <main className=" container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="border-b-4 border-primary pb-4 flex items-center justify-between">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">
            {categoryName} News
          </h1>
          <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
            Showing all stories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {Array.from({ length: 10 }).map((_, i) => (
            <Link key={i} href={`/news/cat-${slug}-${i}`}>
              <NewsCard
                title={`Significant news headline for the ${categoryName} section that takes up two lines`}
                category={categoryName}
                time={`${i + 1}h ago`}
              />
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 pt-12 border-t">
          <Button variant="outline" size="sm" className="font-bold" disabled>
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="font-bold h-8 w-8 p-0"
          >
            1
          </Button>
          <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
            2
          </Button>
          <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
            3
          </Button>
          <span className="text-muted-foreground">...</span>
          <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
            12
          </Button>
          <Button variant="outline" size="sm" className="font-bold">
            Next
          </Button>
        </div>
      </div>
    </main>
  );
}
