import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/frontend/NewsCard";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const category = await Category.findOne({
    slug: String(slug).trim().toLowerCase(),
    isActive: true,
  })
    .select("_id name slug description")
    .lean<{
      _id: string;
      name: string;
      slug: string;
      description?: string;
    } | null>();

  if (!category) {
    notFound();
  }

  const news = await News.find({
    category: category._id,
    status: "published",
  })
    .select(
      "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
    )
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean<
      Array<{
        _id: string;
        title: string;
        slug: string;
        excerpt?: string;
        featuredImage?: string;
        publishedAt?: string | null;
        createdAt?: string;
        isBreaking?: boolean;
        category?: {
          _id?: string;
          name: string;
          slug: string;
        } | null;
      }>
    >();

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="border-b-4 border-primary pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter italic md:text-5xl">
                {category.name} News
              </h1>
              {category.description ? (
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  {category.description}
                </p>
              ) : null}
            </div>

            <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {news.length} {news.length === 1 ? "story" : "stories"}
            </span>
          </div>
        </div>

        {news.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
            <h2 className="text-xl font-semibold">No published news found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no published articles in this category yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
              {news.map((item) => {
                const publishDate = item.publishedAt || item.createdAt;
                const timeText = publishDate
                  ? formatDistanceToNow(new Date(publishDate), {
                      addSuffix: true,
                    })
                  : "Recently";

                return (
                  <Link key={item._id} href={`/news/${item.slug}`}>
                    <div className="cursor-pointer">
                      <NewsCard
                        title={item.title}
                        category={item.category?.name || category.name}
                        time={timeText}
                        image={item.featuredImage}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-2 border-t pt-12">
              <Button
                variant="outline"
                size="sm"
                className="font-bold"
                disabled
              >
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 font-bold"
              >
                1
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="font-bold"
                disabled
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

// // import { Header, Footer, NewsCard } from "@/components/FrontendLayout";
// // import { useParams, Link } from "wouter";
// import { NewsCard } from "@/components/frontend/NewsCard";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { useParams } from "next/navigation";

// export default function CategoryPage() {
//   const { slug } = useParams();
//   // const pathname = usePathname();
//   const categoryName = slug?.charAt(0).toUpperCase() + slug?.slice(1);

//   return (
//     <main className=" container mx-auto px-4 py-12">
//       <div className="max-w-4xl mx-auto space-y-12">
//         <div className="border-b-4 border-primary pb-4 flex items-center justify-between">
//           <h1 className="text-5xl font-black uppercase tracking-tighter italic">
//             {categoryName} News
//           </h1>
//           <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
//             Showing all stories
//           </span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
//           {Array.from({ length: 10 }).map((_, i) => (
//             <Link key={i} href={`/news/cat-${slug}-${i}`}>
//               <NewsCard
//                 title={`Significant news headline for the ${categoryName} section that takes up two lines`}
//                 category={categoryName}
//                 time={`${i + 1}h ago`}
//               />
//             </Link>
//           ))}
//         </div>

//         {/* Pagination */}
//         <div className="flex justify-center items-center gap-2 pt-12 border-t">
//           <Button variant="outline" size="sm" className="font-bold" disabled>
//             Previous
//           </Button>
//           <Button
//             variant="secondary"
//             size="sm"
//             className="font-bold h-8 w-8 p-0"
//           >
//             1
//           </Button>
//           <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
//             2
//           </Button>
//           <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
//             3
//           </Button>
//           <span className="text-muted-foreground">...</span>
//           <Button variant="ghost" size="sm" className="font-bold h-8 w-8 p-0">
//             12
//           </Button>
//           <Button variant="outline" size="sm" className="font-bold">
//             Next
//           </Button>
//         </div>
//       </div>
//     </main>
//   );
// }
