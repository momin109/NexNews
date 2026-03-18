export async function getHomePageData() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/public/home`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch homepage data");
  }

  return res.json();
}
