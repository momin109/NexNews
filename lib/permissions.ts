export const routePermission: Record<string, string> = {
  "/admin/dashboard": "dashboard",
  "/admin/categories": "categories",
  "/admin/news": "news",
  "/admin/media": "media",
  "/admin/breaking-news": "breaking_news",
  "/admin/homepage": "homepage",
  "/admin/seo": "seo",
  "/admin/comments": "comments",
  "/admin/settings": "settings",
  "/admin/analytics": "analytics",
};

export type UserRole = "super_admin" | "admin" | "editor" | "reporter";

export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    "dashboard",
    "categories",
    "news",
    "media",
    "breaking_news",
    "homepage",
    "seo",
    "comments",
    "settings",
    "analytics",
  ],
  admin: [
    "dashboard",
    "categories",
    "news",
    "media",
    "breaking_news",
    "homepage",
    "seo",
    "comments",
    "settings",
  ],
  editor: [
    "dashboard",
    "categories",
    "news",
    "media",
    "breaking_news",
    "comments",
  ],
  reporter: ["dashboard", "news", "media"],
};

export function hasPermission(role: UserRole, permission: string) {
  return rolePermissions[role]?.includes(permission) ?? false;
}
