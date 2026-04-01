import Link from "next/link";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/frontend/NewsCard";
import type { Metadata } from "next";

type SearchParams = Promise<{
  q?: string;
  page?: string;
}>;

const LIMIT = 10;

export const metadata: Metadata = {
  title: "Search News | News Portal",
  description: "Search published news articles by keyword.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = (params.q || "").trim();
  const currentPage = Math.max(Number(params.page || 1), 1);

  await connectDB();

  let results: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt?: string;
    featuredImage?: string;
    publishedAt?: string | null;
    createdAt?: string;
    category?: {
      _id?: string;
      name: string;
      slug: string;
    } | null;
  }> = [];

  let total = 0;

  if (query) {
    const dbQuery = {
      status: "published",
      $or: [
        { title: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    total = await News.countDocuments(dbQuery);
    const totalPages = Math.max(1, Math.ceil(total / LIMIT));
    const safePage = Math.min(currentPage, totalPages);

    const docs = await News.find(dbQuery)
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((safePage - 1) * LIMIT)
      .limit(LIMIT)
      .lean();

    results = docs.map((item: any) => ({
      _id: item._id.toString(),
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      featuredImage: item.featuredImage,
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString()
        : null,
      createdAt: item.createdAt
        ? new Date(item.createdAt).toISOString()
        : undefined,
      category: item.category
        ? {
            _id: item.category._id ? item.category._id.toString() : undefined,
            name: item.category.name,
            slug: item.category.slug,
          }
        : null,
    }));

    const buildUrl = (page: number) => {
      const qp = new URLSearchParams();
      if (query) qp.set("q", query);
      if (page > 1) qp.set("page", String(page));
      return `/search?${qp.toString()}`;
    };

    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="space-y-6 rounded-2xl border bg-card p-8 text-center shadow-lg">
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              Search News
            </h1>

            <form
              action="/search"
              method="GET"
              className="relative mx-auto max-w-2xl"
            >
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Type keywords and hit enter..."
                className="h-12 rounded-full border-2 pl-12 text-lg focus-visible:ring-primary"
              />
            </form>
          </div>

          <div className="space-y-8">
            <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tighter">
                Search Results for "{query}"
              </h2>
              <span className="text-sm font-bold uppercase text-muted-foreground">
                {total} Results found
              </span>
            </div>

            {results.length === 0 ? (
              <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
                <h2 className="text-xl font-semibold">No results found</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different keyword or broader search term.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {results.map((item) => (
                    <div
                      key={String(item._id)}
                      className="border-b pb-8 last:border-0"
                    >
                      <Link href={`/news/${item.slug}`}>
                        <div className="cursor-pointer">
                          <NewsCard
                            title={item.title}
                            category={item.category?.name || "News"}
                            time={
                              item.publishedAt || item.createdAt
                                ? format(
                                    new Date(
                                      item.publishedAt || item.createdAt!,
                                    ),
                                    "MMM dd, yyyy",
                                  )
                                : "Recently"
                            }
                            image={item.featuredImage}
                            horizontal
                          />
                        </div>
                      </Link>

                      {item.excerpt ? (
                        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground md:ml-36">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {total > LIMIT && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      disabled={currentPage <= 1}
                    >
                      <Link href={buildUrl(currentPage - 1)}>Previous</Link>
                    </Button>

                    <span className="px-3 text-sm text-muted-foreground">
                      Page {currentPage} of{" "}
                      {Math.max(1, Math.ceil(total / LIMIT))}
                    </span>

                    <Button
                      asChild
                      variant="outline"
                      disabled={currentPage >= Math.ceil(total / LIMIT)}
                    >
                      <Link href={buildUrl(currentPage + 1)}>Next</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="space-y-6 rounded-2xl border bg-card p-8 text-center shadow-lg">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Search News
          </h1>

          <form
            action="/search"
            method="GET"
            className="relative mx-auto max-w-2xl"
          >
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              defaultValue=""
              placeholder="Type keywords and hit enter..."
              className="h-12 rounded-full border-2 pl-12 text-lg focus-visible:ring-primary"
            />
          </form>
        </div>

        <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
          <h2 className="text-xl font-semibold">Start searching</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a keyword to search published news articles.
          </p>
        </div>
      </div>
    </main>
  );
}

// "use client";

// import { FormEvent, useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { format } from "date-fns";
// import { Search } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { NewsCard } from "@/components/frontend/NewsCard";

// type SearchResult = {
//   _id: string;
//   title: string;
//   slug: string;
//   excerpt?: string;
//   featuredImage?: string;
//   publishedAt?: string | null;
//   createdAt?: string;
//   category?: {
//     _id?: string;
//     name: string;
//     slug: string;
//   } | null;
// };

// export default function SearchPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const query = searchParams.get("q") || "";
//   const page = Math.max(Number(searchParams.get("page") || 1), 1);

//   const [inputValue, setInputValue] = useState(query);
//   const [results, setResults] = useState<SearchResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   const [total, setTotal] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     setInputValue(query);
//   }, [query]);

//   useEffect(() => {
//     const fetchResults = async () => {
//       try {
//         setLoading(true);
//         setMessage("");

//         const params = new URLSearchParams();
//         if (query) params.set("q", query);
//         params.set("page", String(page));
//         params.set("limit", "10");

//         const res = await fetch(`/api/public/search?${params.toString()}`, {
//           method: "GET",
//           cache: "no-store",
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           setMessage(data.message || "Failed to search");
//           return;
//         }

//         setResults(data.results || []);
//         setTotal(data.total || 0);
//         setTotalPages(data.totalPages || 1);
//       } catch (error) {
//         console.error("Search page error:", error);
//         setMessage("Failed to search news");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResults();
//   }, [query, page]);

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();

//     const trimmed = inputValue.trim();

//     if (!trimmed) {
//       router.push("/search");
//       return;
//     }

//     router.push(`/search?q=${encodeURIComponent(trimmed)}`);
//   };

//   const handlePageChange = (nextPage: number) => {
//     if (nextPage < 1 || nextPage > totalPages) return;

//     const params = new URLSearchParams();
//     if (query) params.set("q", query);
//     params.set("page", String(nextPage));

//     router.push(`/search?${params.toString()}`);
//   };

//   return (
//     <main className="container mx-auto px-4 py-12">
//       <div className="mx-auto max-w-5xl space-y-12">
//         <div className="space-y-6 rounded-2xl border bg-card p-8 text-center shadow-lg">
//           <h1 className="text-4xl font-black uppercase tracking-tighter italic">
//             Search News
//           </h1>

//           <form onSubmit={handleSubmit} className="relative mx-auto max-w-2xl">
//             <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
//             <Input
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Type keywords and hit enter..."
//               className="h-12 rounded-full border-2 pl-12 text-lg focus-visible:ring-primary"
//             />
//           </form>
//         </div>

//         <div className="space-y-8">
//           <div className="flex flex-col gap-3 border-b pb-4 md:flex-row md:items-center md:justify-between">
//             <h2 className="text-2xl font-black uppercase tracking-tighter">
//               Search Results for "{query || "..."}"
//             </h2>

//             <span className="text-sm font-bold uppercase text-muted-foreground">
//               {total} Results found
//             </span>
//           </div>

//           {message ? (
//             <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {message}
//             </div>
//           ) : loading ? (
//             <p className="text-sm text-muted-foreground">Searching news...</p>
//           ) : !query ? (
//             <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
//               <h2 className="text-xl font-semibold">Start searching</h2>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Enter a keyword to search news articles.
//               </p>
//             </div>
//           ) : results.length === 0 ? (
//             <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
//               <h2 className="text-xl font-semibold">No results found</h2>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Try a different keyword or broader search term.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="space-y-8">
//                 {results.map((item) => (
//                   <div key={item._id} className="border-b pb-8 last:border-0">
//                     <Link href={`/news/${item.slug}`}>
//                       <div className="cursor-pointer">
//                         <NewsCard
//                           title={item.title}
//                           category={item.category?.name || "News"}
//                           time={
//                             item.publishedAt || item.createdAt
//                               ? format(
//                                   new Date(item.publishedAt || item.createdAt!),
//                                   "MMM dd, yyyy",
//                                 )
//                               : "Recently"
//                           }
//                           image={item.featuredImage}
//                           horizontal
//                         />
//                       </div>
//                     </Link>

//                     {item.excerpt ? (
//                       <p className="mt-4 text-sm text-muted-foreground md:ml-36 line-clamp-2">
//                         {item.excerpt}
//                       </p>
//                     ) : null}
//                   </div>
//                 ))}
//               </div>

//               {totalPages > 1 && (
//                 <div className="flex items-center justify-center gap-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => handlePageChange(page - 1)}
//                     disabled={page <= 1}
//                   >
//                     Previous
//                   </Button>

//                   <span className="px-3 text-sm text-muted-foreground">
//                     Page {page} of {totalPages}
//                   </span>

//                   <Button
//                     variant="outline"
//                     onClick={() => handlePageChange(page + 1)}
//                     disabled={page >= totalPages}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
