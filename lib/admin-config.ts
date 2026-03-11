import {
  LayoutDashboard,
  Newspaper,
  Tags,
  Zap,
  Image as ImageIcon,
  Home,
  Search,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
} from "lucide-react";

export type UserRole = "super_admin" | "admin" | "editor" | "reporter";

export type AdminPermission =
  | "dashboard"
  | "users"
  | "news"
  | "categories"
  | "breaking_news"
  | "media"
  | "homepage"
  | "seo"
  | "comments"
  | "settings"
  | "analytics";

export const rolePermissions: Record<UserRole, AdminPermission[]> = {
  super_admin: [
    "dashboard",
    "users",
    "news",
    "categories",
    "breaking_news",
    "media",
    "homepage",
    "seo",
    "comments",
    "settings",
    "analytics",
  ],
  admin: [
    "dashboard",
    "news",
    "categories",
    "breaking_news",
    "media",
    "homepage",
    "seo",
    "comments",
    "settings",
  ],
  editor: [
    "dashboard",
    "news",
    "categories",
    "breaking_news",
    "media",
    "comments",
  ],
  reporter: ["dashboard", "news", "media"],
};

export const adminSidebarMenu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin/dashboard",
    permission: "dashboard" as AdminPermission,
  },
  {
    icon: Users,
    label: "User Management",
    href: "/admin/users",
    permission: "users" as AdminPermission,
  },
  {
    icon: Newspaper,
    label: "News Management",
    href: "/admin/news",
    permission: "news" as AdminPermission,
  },
  {
    icon: Tags,
    label: "Categories",
    href: "/admin/categories",
    permission: "categories" as AdminPermission,
  },
  {
    icon: Zap,
    label: "Breaking News",
    href: "/admin/breaking-news",
    permission: "breaking_news" as AdminPermission,
  },
  {
    icon: ImageIcon,
    label: "Media Upload",
    href: "/admin/media",
    permission: "media" as AdminPermission,
  },
  {
    icon: Home,
    label: "Homepage Control",
    href: "/admin/homepage",
    permission: "homepage" as AdminPermission,
  },
  {
    icon: Search,
    label: "Basic SEO",
    href: "/admin/seo",
    permission: "seo" as AdminPermission,
  },
  {
    icon: MessageSquare,
    label: "Comments",
    href: "/admin/comments",
    permission: "comments" as AdminPermission,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    permission: "settings" as AdminPermission,
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/admin/analytics",
    permission: "analytics" as AdminPermission,
  },
];

export function hasPermission(role: UserRole, permission: AdminPermission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getAccessibleAdminMenu(role: UserRole) {
  return adminSidebarMenu.filter((item) =>
    hasPermission(role, item.permission),
  );
}

export function isRouteActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getMatchingAdminRoute(pathname: string) {
  return [...adminSidebarMenu]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
}
