"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { getMatchingAdminRoute, hasPermission } from "@/lib/admin-config";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, logoutLoading } = useAuthUser();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/admin/login");
      return;
    }

    const currentRoute = getMatchingAdminRoute(pathname);
    if (currentRoute && !hasPermission(user.role, currentRoute.permission)) {
      router.replace("/unauthorized");
    }
  }, [user, loading, pathname, router]);

  const pageTitle =
    pathname === "/admin" || pathname === "/admin/dashboard"
      ? "Dashboard"
      : pathname.split("/").pop()?.replace(/-/g, " ") || "Admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <AdminSidebar
        pathname={pathname}
        role={user.role}
        logout={logout}
        logoutLoading={logoutLoading}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          pageTitle={pageTitle}
          user={user}
          logout={logout}
          logoutLoading={logoutLoading}
        />
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//   LayoutDashboard,
//   Newspaper,
//   Tags,
//   Zap,
//   Image as ImageIcon,
//   Home,
//   Search,
//   MessageSquare,
//   Settings,
//   LogOut,
//   ChevronDown,
//   Shield,
//   Users,
//   BarChart3,
// } from "lucide-react";

// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// type UserRole = "super_admin" | "admin" | "editor" | "reporter";

// type AuthUser = {
//   userId: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   isActive: boolean;
// };

// const sidebarMenu = [
//   {
//     icon: LayoutDashboard,
//     label: "Dashboard",
//     href: "/admin/dashboard",
//     permission: "dashboard",
//   },
//   {
//     icon: Users,
//     label: "User Management",
//     href: "/admin/users",
//     permission: "users",
//   },
//   {
//     icon: Newspaper,
//     label: "News Management",
//     href: "/admin/news",
//     permission: "news",
//   },
//   {
//     icon: Tags,
//     label: "Categories",
//     href: "/admin/categories",
//     permission: "categories",
//   },
//   {
//     icon: Zap,
//     label: "Breaking News",
//     href: "/admin/breaking-news",
//     permission: "breaking_news",
//   },
//   {
//     icon: ImageIcon,
//     label: "Media Upload",
//     href: "/admin/media",
//     permission: "media",
//   },
//   {
//     icon: Home,
//     label: "Homepage Control",
//     href: "/admin/homepage",
//     permission: "homepage",
//   },
//   {
//     icon: Search,
//     label: "Basic SEO",
//     href: "/admin/seo",
//     permission: "seo",
//   },
//   {
//     icon: MessageSquare,
//     label: "Comments",
//     href: "/admin/comments",
//     permission: "comments",
//   },
//   {
//     icon: Settings,
//     label: "Settings",
//     href: "/admin/settings",
//     permission: "settings",
//   },
//   {
//     icon: BarChart3,
//     label: "Analytics",
//     href: "/admin/analytics",
//     permission: "analytics",
//   },
// ];

// const rolePermissions: Record<UserRole, string[]> = {
//   super_admin: [
//     "dashboard",
//     "users",
//     "news",
//     "categories",
//     "breaking_news",
//     "media",
//     "homepage",
//     "seo",
//     "comments",
//     "settings",
//     "analytics",
//   ],
//   admin: [
//     "dashboard",
//     "news",
//     "categories",
//     "breaking_news",
//     "media",
//     "homepage",
//     "seo",
//     "comments",
//     "settings",
//   ],
//   editor: [
//     "dashboard",
//     "news",
//     "categories",
//     "breaking_news",
//     "media",
//     "comments",
//   ],
//   reporter: ["dashboard", "news", "media"],
// };

// function hasPermission(role: UserRole, permission: string) {
//   return rolePermissions[role]?.includes(permission) ?? false;
// }

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [user, setUser] = useState<AuthUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [logoutLoading, setLogoutLoading] = useState(false);

//   const fetchMe = useCallback(async () => {
//     try {
//       const res = await fetch("/api/auth/me", {
//         method: "GET",
//         credentials: "include",
//         cache: "no-store",
//       });

//       const contentType = res.headers.get("content-type") || "";

//       if (!contentType.includes("application/json")) {
//         setUser(null);
//         router.push("/admin/login");
//         return;
//       }

//       const data = await res.json();

//       if (!res.ok || !data.success) {
//         setUser(null);
//         router.push("/admin/login");
//         return;
//       }

//       setUser(data.user);
//     } catch (error) {
//       console.error("Fetch current user failed:", error);
//       setUser(null);
//       router.push("/admin/login");
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     let mounted = true;

//     const safeFetch = async () => {
//       if (!mounted) return;
//       await fetchMe();
//     };

//     safeFetch();

//     const handleFocus = () => {
//       safeFetch();
//     };

//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible") {
//         safeFetch();
//       }
//     };

//     window.addEventListener("focus", handleFocus);
//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     const interval = setInterval(() => {
//       safeFetch();
//     }, 10000);

//     return () => {
//       mounted = false;
//       window.removeEventListener("focus", handleFocus);
//       document.removeEventListener("visibilitychange", handleVisibilityChange);
//       clearInterval(interval);
//     };
//   }, [fetchMe]);

//   const filteredMenu = useMemo(() => {
//     if (!user) return [];
//     return sidebarMenu.filter((item) =>
//       hasPermission(user.role, item.permission),
//     );
//   }, [user]);

//   useEffect(() => {
//     if (!user) return;

//     const currentRoute = sidebarMenu
//       .sort((a, b) => b.href.length - a.href.length)
//       .find((item) => pathname.startsWith(item.href));

//     if (currentRoute && !hasPermission(user.role, currentRoute.permission)) {
//       router.push("/unauthorized");
//     }
//   }, [user, pathname, router]);

//   const handleLogout = async () => {
//     try {
//       setLogoutLoading(true);

//       await fetch("/api/auth/logout", {
//         method: "POST",
//         credentials: "include",
//       });

//       setUser(null);
//       router.push("/admin/login");
//       router.refresh();
//     } catch (error) {
//       console.error("Logout failed:", error);
//     } finally {
//       setLogoutLoading(false);
//     }
//   };

//   const pageTitle =
//     pathname === "/admin" || pathname === "/admin/dashboard"
//       ? "Dashboard"
//       : pathname.split("/").pop()?.replace(/-/g, " ") || "Admin";

//   const initials =
//     user?.name
//       ?.split(" ")
//       .map((part) => part[0])
//       .join("")
//       .slice(0, 2)
//       .toUpperCase() || "AD";

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-sm text-muted-foreground">Loading admin panel...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex flex-col md:flex-row">
//       <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col flex-shrink-0 border-r border-sidebar-border">
//         <div className="p-6 pb-2 border-b border-sidebar-border flex items-center gap-3">
//           <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
//             <Newspaper size={18} />
//           </div>
//           <span className="font-bold text-xl tracking-tight">NewsAdmin</span>
//         </div>

//         <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
//           {filteredMenu.map((item) => {
//             const isActive =
//               pathname === item.href || pathname.startsWith(item.href);
//             const Icon = item.icon;

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
//                   isActive
//                     ? "bg-sidebar-accent text-sidebar-accent-foreground"
//                     : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
//                 }`}
//               >
//                 <Icon size={18} />
//                 {item.label}
//               </Link>
//             );
//           })}
//         </div>

//         <div className="p-4 border-t border-sidebar-border">
//           <button
//             type="button"
//             onClick={handleLogout}
//             disabled={logoutLoading}
//             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-red-400 transition-colors text-sm font-medium"
//           >
//             <LogOut size={18} />
//             {logoutLoading ? "Logging out..." : "Logout"}
//           </button>
//         </div>
//       </aside>

//       <main className="flex-1 flex flex-col min-w-0">
//         <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
//           <div className="md:hidden font-bold text-lg flex items-center gap-2">
//             <Newspaper size={18} className="text-primary" />
//             NewsAdmin
//           </div>

//           <div className="hidden md:block">
//             <h2 className="text-lg font-semibold text-foreground capitalize">
//               {pageTitle}
//             </h2>
//           </div>

//           <div className="flex items-center gap-4">
//             <Link
//               href="/"
//               className="text-sm text-primary hover:underline font-medium hidden sm:block"
//             >
//               View Live Site
//             </Link>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button className="flex items-center gap-2 hover:bg-accent p-1.5 rounded-full transition-colors outline-none">
//                   <Avatar className="w-8 h-8 border">
//                     <AvatarFallback className="bg-primary/10 text-primary text-xs">
//                       {initials}
//                     </AvatarFallback>
//                   </Avatar>
//                   <ChevronDown
//                     size={14}
//                     className="text-muted-foreground hidden sm:block"
//                   />
//                 </button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-56">
//                 <DropdownMenuLabel>
//                   <div className="flex flex-col space-y-1">
//                     <p className="text-sm font-medium leading-none">
//                       {user?.name || "Admin User"}
//                     </p>
//                     <p className="text-xs leading-none text-muted-foreground">
//                       {user?.email || "admin@newsportal.com"}
//                     </p>
//                     <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
//                       Role: {user?.role?.replace("_", " ")}
//                     </p>
//                   </div>
//                 </DropdownMenuLabel>

//                 <DropdownMenuSeparator />

//                 <DropdownMenuItem asChild>
//                   <Link
//                     href="/admin/settings"
//                     className="cursor-pointer flex items-center"
//                   >
//                     <Shield className="mr-2 h-4 w-4" />
//                     <span>Change Password</span>
//                   </Link>
//                 </DropdownMenuItem>

//                 <DropdownMenuSeparator />

//                 <DropdownMenuItem
//                   onClick={handleLogout}
//                   className="text-destructive cursor-pointer"
//                 >
//                   <LogOut className="mr-2 h-4 w-4" />
//                   <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </header>

//         <div className="flex-1 p-6 overflow-y-auto">{children}</div>
//       </main>
//     </div>
//   );
// }
