export const dynamic = "force-dynamic";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { NewsCard } from "@/components/frontend/NewsCard";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home | News Portal",
  description:
    "Read the latest breaking news, featured stories, and category-wise updates from our news portal.",
};

type CategoryType = {
  _id?: string;
  name: string;
  slug: string;
};

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  publishedAt?: string | null;
  createdAt?: string;
  isBreaking?: boolean;
  category?: CategoryType | null;
};

type CategorySection = {
  category: CategoryType;
  news: NewsItem[];
};

export default async function HomePage() {
  await connectDB();

  const featuredNews = await News.findOne({
    status: "published",
  })
    .select(
      "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
    )
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean<NewsItem | null>();

  const breakingNews = await News.find({
    status: "published",
    isBreaking: true,
  })
    .select(
      "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
    )
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(5)
    .lean<NewsItem[]>();

  const latestNews = await News.find({
    status: "published",
  })
    .select(
      "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
    )
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(12)
    .lean<NewsItem[]>();

  const activeCategories = await Category.find({
    isActive: true,
  })
    .select("_id name slug")
    .sort({ createdAt: -1 })
    .limit(4)
    .lean<CategoryType[]>();

  const categorySections: CategorySection[] = [];

  for (const category of activeCategories) {
    const news = await News.find({
      status: "published",
      category: category._id,
    })
      .select(
        "_id title slug excerpt featuredImage publishedAt createdAt isBreaking category",
      )
      .populate("category", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(4)
      .lean<NewsItem[]>();

    if (news.length > 0) {
      categorySections.push({
        category,
        news,
      });
    }
  }

  const getTimeText = (item: NewsItem) => {
    const date = item.publishedAt || item.createdAt;
    if (!date) return "Recently";

    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
    });
  };

  return (
    <main className="container mx-auto space-y-16 px-4 py-10">
      {breakingNews.length > 0 && (
        <section className="rounded-2xl border bg-red-50 p-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              Breaking
            </span>
            <h2 className="text-lg font-bold">Latest Breaking Updates</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {breakingNews.slice(0, 4).map((item) => (
              <Link key={item._id} href={`/news/${item.slug}`}>
                <div className="cursor-pointer rounded-lg bg-white p-4 transition hover:shadow-sm">
                  <p className="text-sm font-semibold leading-snug">
                    {item.title}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.category?.name || "News"} • {getTimeText(item)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featuredNews && (
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Link href={`/news/${featuredNews.slug}`}>
              <div className="cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
                {featuredNews.featuredImage ? (
                  <img
                    src={featuredNews.featuredImage}
                    alt={featuredNews.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-muted" />
                )}

                <div className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                      {featuredNews.category?.name || "Featured"}
                    </span>
                  </div>

                  <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
                    {featuredNews.title}
                  </h1>

                  {featuredNews.excerpt ? (
                    <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                      {featuredNews.excerpt}
                    </p>
                  ) : null}

                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {getTimeText(featuredNews)}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              Latest News
            </h2>

            <div className="space-y-6">
              {latestNews.slice(0, 4).map((item) => (
                <Link key={item._id} href={`/news/${item.slug}`}>
                  <div className="cursor-pointer">
                    <NewsCard
                      title={item.title}
                      category={item.category?.name || "News"}
                      time={getTimeText(item)}
                      image={item.featuredImage}
                      horizontal
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="space-y-8 border-t pt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            More Stories
          </h2>

          <Button asChild variant="outline">
            <Link href="/news">View More</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {latestNews.slice(4, 12).map((item) => (
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
      </section>

      {categorySections.map((section) => (
        <section
          key={section.category._id || section.category.slug}
          className="space-y-8 border-t pt-10"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {section.category.name}
            </h2>

            <Button asChild variant="outline">
              <Link href={`/category/${section.category.slug}`}>View All</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {section.news.map((item) => (
              <Link key={item._id} href={`/news/${item.slug}`}>
                <div className="cursor-pointer">
                  <NewsCard
                    title={item.title}
                    category={item.category?.name || section.category.name}
                    time={getTimeText(item)}
                    image={item.featuredImage}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
