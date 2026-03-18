export async function getPublicCategoryNews(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public/categories/${slug}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function getActiveCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const data = await res.json();

  return (data.categories || []).filter((cat: any) => cat.isActive);
}
