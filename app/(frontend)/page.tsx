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

//=================================================

// import Link from "next/link";
// import { formatDistanceToNow } from "date-fns";
// import { Button } from "@/components/ui/button";
// import { NewsCard } from "@/components/frontend/NewsCard";
// import { getHomePageData } from "@/lib/public-api/home";

// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Home | News Portal",
//   description:
//     "Read the latest breaking news, featured stories, and category-wise updates from our news portal.",
// };

// export default async function HomePage() {
//   const data = await getHomePageData();

//   const featuredNews = data.featuredNews;
//   const breakingNews = data.breakingNews || [];
//   const latestNews = data.latestNews || [];
//   const categorySections = data.categorySections || [];

//   const getTimeText = (item: any) => {
//     const date = item.publishedAt || item.createdAt;
//     if (!date) return "Recently";

//     return formatDistanceToNow(new Date(date), {
//       addSuffix: true,
//     });
//   };

//   return (
//     <main className="container mx-auto space-y-16 px-4 py-10">
//       {breakingNews.length > 0 && (
//         <section className="rounded-2xl border bg-red-50 p-4">
//           <div className="mb-4 flex items-center gap-3">
//             <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
//               Breaking
//             </span>
//             <h2 className="text-lg font-bold">Latest Breaking Updates</h2>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             {breakingNews.slice(0, 4).map((item: any) => (
//               <Link key={item._id} href={`/news/${item.slug}`}>
//                 <div className="cursor-pointer rounded-lg bg-white p-4 transition hover:shadow-sm">
//                   <p className="text-sm font-semibold leading-snug">
//                     {item.title}
//                   </p>
//                   <p className="mt-2 text-xs text-muted-foreground">
//                     {item.category?.name || "News"} • {getTimeText(item)}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </section>
//       )}

//       {featuredNews && (
//         <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
//           <div className="lg:col-span-8">
//             <Link href={`/news/${featuredNews.slug}`}>
//               <div className="cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
//                 {featuredNews.featuredImage ? (
//                   <img
//                     src={featuredNews.featuredImage}
//                     alt={featuredNews.title}
//                     className="aspect-[16/9] w-full object-cover"
//                   />
//                 ) : (
//                   <div className="aspect-[16/9] w-full bg-muted" />
//                 )}

//                 <div className="space-y-4 p-6">
//                   <div className="flex items-center gap-3">
//                     <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
//                       {featuredNews.category?.name || "Featured"}
//                     </span>
//                   </div>

//                   <h1 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">
//                     {featuredNews.title}
//                   </h1>

//                   {featuredNews.excerpt ? (
//                     <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
//                       {featuredNews.excerpt}
//                     </p>
//                   ) : null}

//                   <p className="text-xs uppercase tracking-widest text-muted-foreground">
//                     {getTimeText(featuredNews)}
//                   </p>
//                 </div>
//               </div>
//             </Link>
//           </div>

//           <div className="space-y-6 lg:col-span-4">
//             <h2 className="text-2xl font-black uppercase tracking-tighter">
//               Latest News
//             </h2>

//             <div className="space-y-6">
//               {latestNews.slice(0, 4).map((item: any) => (
//                 <Link key={item._id} href={`/news/${item.slug}`}>
//                   <div className="cursor-pointer">
//                     <NewsCard
//                       title={item.title}
//                       category={item.category?.name || "News"}
//                       time={getTimeText(item)}
//                       image={item.featuredImage}
//                       horizontal
//                     />
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       <section className="space-y-8 border-t pt-10">
//         <div className="flex items-center justify-between">
//           <h2 className="text-3xl font-black uppercase tracking-tighter">
//             More Stories
//           </h2>

//           <Button asChild variant="outline">
//             <Link href="/news">View More</Link>
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
//           {latestNews.slice(4, 12).map((item: any) => (
//             <Link key={item._id} href={`/news/${item.slug}`}>
//               <div className="cursor-pointer">
//                 <NewsCard
//                   title={item.title}
//                   category={item.category?.name || "News"}
//                   time={getTimeText(item)}
//                   image={item.featuredImage}
//                 />
//               </div>
//             </Link>
//           ))}
//         </div>
//       </section>

//       {categorySections.map((section: any) => (
//         <section
//           key={section.category._id || section.category.slug}
//           className="space-y-8 border-t pt-10"
//         >
//           <div className="flex items-center justify-between">
//             <h2 className="text-3xl font-black uppercase tracking-tighter">
//               {section.category.name}
//             </h2>

//             <Button asChild variant="outline">
//               <Link href={`/category/${section.category.slug}`}>View All</Link>
//             </Button>
//           </div>

//           <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
//             {section.news.map((item: any) => (
//               <Link key={item._id} href={`/news/${item.slug}`}>
//                 <div className="cursor-pointer">
//                   <NewsCard
//                     title={item.title}
//                     category={item.category?.name || section.category.name}
//                     time={getTimeText(item)}
//                     image={item.featuredImage}
//                   />
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </section>
//       ))}
//     </main>
//   );
// }

///======================================================================

// // import { Header, Footer, BreakingNewsTicker, NewsCard } from "@/components/FrontendLayout";

// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ArrowRight, TrendingUp } from "lucide-react";

// import { BreakingNewsTicker } from "@/components/frontend/BreakingNewsTicker";
// import { NewsCard } from "@/components/frontend/NewsCard";

// const newsItems = [
//   {
//     id: 1,
//     title: "Global Summit Reaches New Climate Agreement",
//     category: "World",
//     time: "2h ago",
//     image:
//       "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop",
//   },
//   {
//     id: 2,
//     title: "Tech Giant Unveils Revolutionary AI Model",
//     category: "Technology",
//     time: "5h ago",
//     image:
//       "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
//   },
//   {
//     id: 3,
//     title: "Local Team Wins Championship After 20 Years",
//     category: "Sports",
//     time: "1d ago",
//     image:
//       "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&h=300&fit=crop",
//   },
//   {
//     id: 4,
//     title: "Market Stocks Rally Amid Economic Optimism",
//     category: "Business",
//     time: "1d ago",
//     image:
//       "https://images.unsplash.com/photo-1611974714024-4607a505b22b?w=500&h=300&fit=crop",
//   },
// ];

// export default function Home() {
//   return (
//     <>
//       <BreakingNewsTicker />

//       <main className=" container mx-auto px-4 py-8">
//         {/* Lead News Section */}
//         <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8 md:mb-12">
//           <div className="lg:col-span-8 group cursor-pointer relative overflow-hidden rounded-xl md:rounded-2xl shadow-2xl shadow-primary/5">
//             <div className="aspect-[16/9] md:aspect-[16/9] w-full bg-muted">
//               <img
//                 src={newsItems[0].image}
//                 alt={newsItems[0].title}
//                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
//               />
//             </div>
//             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-8 text-white">
//               <span className="bg-primary text-primary-foreground px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest w-fit mb-2 md:mb-4">
//                 Lead Story
//               </span>
//               <h2 className="text-xl md:text-3xl lg:text-5xl font-black mb-2 md:mb-4 leading-tight group-hover:underline">
//                 {newsItems[0].title}
//               </h2>
//               <p className="text-white/70 line-clamp-2 max-w-2xl text-sm md:text-lg hidden sm:block">
//                 World leaders gathered in Geneva today for the final day of the
//                 Climate Summit, reaching a historic agreement that aims to slash
//                 carbon emissions by 60% by the year 2040.
//               </p>
//             </div>
//           </div>

//           <div className="lg:col-span-4 space-y-4 md:space-y-6">
//             <h3 className="font-black uppercase tracking-tighter text-xl md:text-2xl flex items-center gap-2 border-l-4 border-primary pl-4">
//               Featured
//             </h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
//               {newsItems.slice(1).map((item) => (
//                 <Link key={item.id} href={`/news/news-${item.id}`}>
//                   <NewsCard {...item} horizontal />
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </section>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//           {/* Main Content Column */}
//           <div className="lg:col-span-8 space-y-12">
//             {/* Latest News Grid */}
//             <section>
//               <div className="flex items-center justify-between mb-8 border-b pb-4">
//                 <h3 className="font-black uppercase tracking-tighter text-3xl">
//                   Latest News
//                 </h3>
//                 <Button variant="ghost" className="font-bold gap-2">
//                   View All <ArrowRight size={16} />
//                 </Button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 {newsItems.map((item) => (
//                   <Link key={item.id} href={`/news/news-${item.id}`}>
//                     <NewsCard {...item} />
//                   </Link>
//                 ))}
//               </div>
//             </section>

//             {/* Category Blocks */}
//             <section className="bg-muted/30 p-8 rounded-2xl border">
//               <div className="flex items-center justify-between mb-8">
//                 <h3 className="font-black uppercase tracking-tighter text-3xl">
//                   National News
//                 </h3>
//                 <Link
//                   href="/category/national"
//                   className="text-primary font-bold"
//                 >
//                   See more
//                 </Link>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 {[1, 2, 3].map((i) => (
//                   <Link key={i} href={`/news/national-${i}`}>
//                     <NewsCard
//                       title="New policy implementation across all states"
//                       category="National"
//                       time="1d ago"
//                     />
//                   </Link>
//                 ))}
//               </div>
//             </section>
//           </div>

//           {/* Sidebar */}
//           <aside className="lg:col-span-4 space-y-10">
//             {/* Popular News */}
//             <div className="bg-card border rounded-2xl p-6 shadow-sm">
//               <h3 className="font-black uppercase tracking-tighter text-xl mb-6 flex items-center gap-2">
//                 <TrendingUp size={20} className="text-primary" /> Popular Now
//               </h3>
//               <div className="space-y-6">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <div
//                     key={i}
//                     className="flex gap-4 group cursor-pointer border-b pb-4 last:border-0 last:pb-0"
//                   >
//                     <span className="text-3xl font-black text-muted-foreground/30 italic group-hover:text-primary transition-colors">
//                       0{i}
//                     </span>
//                     <p className="font-bold leading-snug group-hover:text-primary transition-colors text-sm">
//                       Most read news article title that will be extremely
//                       popular among readers.
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Newsletter Card */}
//             <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center space-y-4 shadow-xl shadow-primary/20">
//               <h4 className="text-2xl font-black italic tracking-tighter uppercase">
//                 Daily Newsletter
//               </h4>
//               <p className="text-primary-foreground/70 text-sm font-medium">
//                 Get the best stories delivered directly to your inbox every
//                 morning.
//               </p>
//               <Input
//                 placeholder="Your email address"
//                 className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-full"
//               />
//               <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-full font-bold">
//                 Subscribe Now
//               </Button>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </>
//   );
// }
