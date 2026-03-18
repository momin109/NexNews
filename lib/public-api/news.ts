export async function getPublicNewsBySlug(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public/news/${slug}`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export async function getPublicNewsArchive(params?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/public/news${
    query ? `?${query}` : ""
  }`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch archive news");
  }

  return res.json();
}
