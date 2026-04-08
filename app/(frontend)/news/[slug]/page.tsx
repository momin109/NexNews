import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User, Share2, Facebook, Twitter, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/frontend/NewsCard";
import CommentSection from "@/components/frontend/CommentSection";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import "@/models/User";
import "@/models/Category";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NewsDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();

  const news = await News.findOne({
    slug: String(slug).trim().toLowerCase(),
    status: "published",
  })
    .populate("category", "name slug")
    .populate("author", "name email")
    .lean<{
      _id: string;
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      featuredImage?: string;
      publishedAt?: string | null;
      createdAt?: string;
      isBreaking?: boolean;
      category?: {
        _id?: string;
        name: string;
        slug: string;
      } | null;
      author?: {
        _id?: string;
        name: string;
        email: string;
      } | null;
    } | null>();

  if (!news) {
    notFound();
  }

  const relatedNews = await News.find({
    _id: { $ne: news._id },
    category: news.category?._id,
    status: "published",
  })
    .select("title slug featuredImage publishedAt createdAt category")
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(4)
    .lean<
      Array<{
        _id: string;
        title: string;
        slug: string;
        featuredImage?: string;
        publishedAt?: string | null;
        createdAt?: string;
        category?: {
          _id?: string;
          name: string;
          slug: string;
        } | null;
      }>
    >();

  const latestNews = await News.find({
    _id: { $ne: news._id },
    status: "published",
  })
    .select("title slug featuredImage publishedAt createdAt category")
    .populate("category", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(5)
    .lean<
      Array<{
        _id: string;
        title: string;
        slug: string;
        featuredImage?: string;
        publishedAt?: string | null;
        createdAt?: string;
        category?: {
          _id?: string;
          name: string;
          slug: string;
        } | null;
      }>
    >();

  const publishDate = news.publishedAt || news.createdAt;
  const formattedDate = publishDate
    ? format(new Date(publishDate), "MMM dd, yyyy • hh:mm a")
    : "Recently";

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <article className="space-y-8 lg:col-span-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-foreground">
                {news.category?.name || "News"}
              </span>

              {news.isBreaking && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-700">
                  Breaking
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              {news.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 border-y py-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2 font-bold text-foreground">
                <User size={16} className="text-primary" />
                {news.author?.name || "Unknown Reporter"}
              </span>

              <span className="flex items-center gap-2">
                <Clock size={16} />
                {formattedDate}
              </span>
            </div>
          </div>

          {news.featuredImage ? (
            <div className="overflow-hidden rounded-2xl bg-muted shadow-lg">
              <img
                src={news.featuredImage}
                alt={news.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          ) : null}

          <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-black prose-p:leading-8">
            {news.excerpt ? (
              <p className="rounded-r-lg border-l-4 border-primary bg-muted/30 py-2 pl-6 text-xl font-bold italic leading-normal text-muted-foreground">
                {news.excerpt}
              </p>
            ) : null}

            <div className="whitespace-pre-line">{news.content}</div>
          </div>

          <CommentSection newsId={String(news._id)} />
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-y py-8">
            <div className="flex items-center gap-2">
              <span className="mr-2 text-xs font-black uppercase tracking-widest">
                Share this:
              </span>

              <Button
                size="icon"
                variant="outline"
                className="rounded-full hover:bg-blue-600 hover:text-white"
              >
                <Facebook size={18} />
              </Button>

              <Button
                size="icon"
                variant="outline"
                className="rounded-full hover:bg-sky-500 hover:text-white"
              >
                <Twitter size={18} />
              </Button>

              <Button
                size="icon"
                variant="outline"
                className="rounded-full hover:bg-green-600 hover:text-white"
              >
                <Share2 size={18} />
              </Button>
            </div>

            <Button variant="ghost" className="gap-2 font-bold">
              <Bookmark size={18} /> Save for later
            </Button>
          </div>

          <section className="pt-12">
            <h3 className="mb-8 text-3xl font-black uppercase tracking-tighter">
              Related Stories
            </h3>

            {relatedNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No related stories found.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {relatedNews.map((item) => (
                  <Link key={item._id} href={`/news/${item.slug}`}>
                    <div className="cursor-pointer">
                      <NewsCard
                        title={item.title}
                        category={item.category?.name || "News"}
                        time={
                          item.publishedAt || item.createdAt
                            ? format(
                                new Date(item.publishedAt || item.createdAt!),
                                "MMM dd, yyyy",
                              )
                            : "Recently"
                        }
                        image={item.featuredImage}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </article>

        <aside className="space-y-12 lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border bg-muted/30 p-6">
            <h3 className="mb-6 border-b pb-4 text-xl font-black uppercase tracking-tighter">
              Latest Updates
            </h3>

            <div className="space-y-6">
              {latestNews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No latest updates found.
                </p>
              ) : (
                latestNews.map((item) => (
                  <Link key={item._id} href={`/news/${item.slug}`}>
                    <div className="cursor-pointer">
                      <NewsCard
                        title={item.title}
                        category={item.category?.name || "Updates"}
                        time={
                          item.publishedAt || item.createdAt
                            ? format(
                                new Date(item.publishedAt || item.createdAt!),
                                "MMM dd, yyyy",
                              )
                            : "Recently"
                        }
                        image={item.featuredImage}
                        horizontal
                      />
                    </div>
                  </Link>
                ))
              )}
            </div>

            <Button
              variant="outline"
              className="mt-6 w-full py-6 text-xs font-bold uppercase tracking-widest"
              asChild
            >
              <Link href="/news">View All News</Link>
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
