import SiteSetting from "@/models/SiteSetting";

export const COMMENTS_ENABLED_KEY = "comments_enabled";

export async function getCommentsEnabled(): Promise<boolean> {
  const setting = await SiteSetting.findOne({
    key: COMMENTS_ENABLED_KEY,
  })
    .select("value")
    .lean<{ value?: string } | null>();

  if (!setting) return true;

  return setting.value === "true";
}

export async function setCommentsEnabled(enabled: boolean) {
  await SiteSetting.findOneAndUpdate(
    { key: COMMENTS_ENABLED_KEY },
    { value: enabled ? "true" : "false" },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
