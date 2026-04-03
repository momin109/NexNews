// import { connectDB } from "@/lib/db";
// import Category from "@/models/Category";
// import HeaderClient from "@/components/frontend/HeaderClient";

// export default async function Header() {
//   await connectDB();

//   const rawCategories = await Category.find({ isActive: true })
//     .select("_id name slug")
//     .sort({ createdAt: -1 })
//     .limit(6)
//     .lean();

//   const categories = rawCategories.map((cat) => ({
//     _id: String(cat._id),
//     name: cat.name,
//     slug: cat.slug,
//   }));

//   return <HeaderClient categories={categories} />;
// }

// import HeaderClient from "@/components/frontend/HeaderClient";

import HeaderClient from "@/components/frontend/HeaderClient";

export default function Header() {
  return <HeaderClient />;
}
