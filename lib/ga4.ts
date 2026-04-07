import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GA4_PROPERTY_ID;

if (!propertyId) {
  throw new Error("Missing GA4_PROPERTY_ID");
}

const client = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export async function getGAOverview() {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    metrics: [
      { name: "activeUsers" },
      { name: "eventCount" },
      { name: "newUsers" },
      { name: "sessions" },
    ],
  });

  const row = response.rows?.[0];

  return {
    activeUsers: Number(row?.metricValues?.[0]?.value ?? 0),
    eventCount: Number(row?.metricValues?.[1]?.value ?? 0),
    newUsers: Number(row?.metricValues?.[2]?.value ?? 0),
    sessions: Number(row?.metricValues?.[3]?.value ?? 0),
  };
}

export async function getGARealtime() {
  const [response] = await client.runRealtimeReport({
    property: `properties/${propertyId}`,
    metrics: [{ name: "activeUsers" }],
    dimensions: [{ name: "country" }],
    limit: 10,
  });

  const countries =
    response.rows?.map((row) => ({
      country: row.dimensionValues?.[0]?.value || "Unknown",
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? [];

  const activeUsersLast30Minutes = countries.reduce(
    (sum, item) => sum + item.activeUsers,
    0,
  );

  return {
    activeUsersLast30Minutes,
    countries,
  };
}

export async function getGATopPages() {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "BEGINS_WITH",
          value: "/news/",
        },
      },
    },
    orderBys: [
      {
        metric: { metricName: "screenPageViews" },
        desc: true,
      },
    ],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      path: row.dimensionValues?.[0]?.value || "",
      views: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? []
  );
}

export async function getGATrafficSources() {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit: 10,
  });

  return (
    response.rows?.map((row) => ({
      label: row.dimensionValues?.[0]?.value || "Unknown",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? []
  );
}

export async function getGAActivitySeries(days: "7daysAgo" | "30daysAgo") {
  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: days, endDate: "today" }],
    dimensions: [{ name: "date" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ dimension: { dimensionName: "date" } }],
  });

  return (
    response.rows?.map((row) => ({
      label: row.dimensionValues?.[0]?.value || "",
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? []
  );
}
