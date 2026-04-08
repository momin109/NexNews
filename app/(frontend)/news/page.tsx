import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { NewsCard } from "@/components/frontend/NewsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import mongoose from "mongoose";

type SearchParams = Promise<{
  search?: string;
  category?: string;
  page?: string;
}>;

const LIMIT = 9;

export default async function NewsArchivePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const search = (params.search || "").trim();
  const categoryFilter = (params.category || "").trim();
  const currentPage = Math.max(Number(params.page || 1), 1);

  await connectDB();

  const categories = await Category.find({ isActive: true })
    .select("_id name slug")
    .sort({ createdAt: -1 })
    .lean<Array<{ _id: string; name: string; slug: string }>>();

  const query: Record<string, unknown> = {
    status: "published",
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  if (categoryFilter && mongoose.Types.ObjectId.isValid(categoryFilter)) {
    query.category = new mongoose.Types.ObjectId(categoryFilter);
  }

  const total = await News.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const safePage = Math.min(currentPage, totalPages);

  const news = await News.find(query)
    .select(
      "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
    )
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip((safePage - 1) * LIMIT)
    .limit(LIMIT)
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

  const getTimeText = (item: {
    publishedAt?: string | null;
    createdAt?: string;
  }) => {
    const date = item.publishedAt || item.createdAt;
    if (!date) return "Recently";

    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
  };

  const pageNumbers = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safePage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  })();

  const buildUrl = (overrides: {
    search?: string;
    category?: string;
    page?: number;
  }) => {
    const qp = new URLSearchParams();

    const nextSearch =
      overrides.search !== undefined ? overrides.search : search;
    const nextCategory =
      overrides.category !== undefined ? overrides.category : categoryFilter;
    const nextPage = overrides.page !== undefined ? overrides.page : safePage;

    if (nextSearch) qp.set("search", nextSearch);
    if (nextCategory) qp.set("category", nextCategory);
    if (nextPage > 1) qp.set("page", String(nextPage));

    const qs = qp.toString();
    return qs ? `/news?${qs}` : "/news";
  };

  return (
    <main className="container mx-auto space-y-10 px-4 py-10">
      <div className="space-y-3">
        <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
          All News
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse the latest published stories from all categories.
        </p>
      </div>

      <form
        action="/news"
        method="GET"
        className="grid grid-cols-1 gap-4 rounded-2xl border bg-card p-4 md:grid-cols-[1fr_240px_auto]"
      >
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search news..."
            className="pl-9"
          />
        </div>

        <select
          name="category"
          defaultValue={categoryFilter}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button type="submit">Filter</Button>
      </form>

      {news.length === 0 ? (
        <div className="rounded-xl border bg-muted/20 px-6 py-10 text-center">
          <h2 className="text-xl font-semibold">No news found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or category filter.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {news.length} of {total} articles
            </p>
            <p className="text-sm text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Link key={item._id} href={`/news/${item.slug}`}>
                <div className="cursor-pointer">
                  <NewsCard
                    title={item.title}
                    category={item.category?.name || "News"}
                    time={getTimeText(item)}
                    image={item.featuredImage}
                  />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-t pt-8">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-bold"
              disabled={safePage <= 1}
            >
              <Link href={buildUrl({ page: safePage - 1 })}>Previous</Link>
            </Button>

            {pageNumbers.map((pageNumber) => (
              <Button
                key={pageNumber}
                asChild
                variant={pageNumber === safePage ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0 font-bold"
              >
                <Link href={buildUrl({ page: pageNumber })}>{pageNumber}</Link>
              </Button>
            ))}

            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-bold"
              disabled={safePage >= totalPages}
            >
              <Link href={buildUrl({ page: safePage + 1 })}>Next</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
