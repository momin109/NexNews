"use client";

import Link from "next/link";
import { LogOut, Newspaper } from "lucide-react";
import {
  getAccessibleAdminMenu,
  isRouteActive,
  type UserRole,
} from "@/lib/admin-config";
type Props = {
  pathname: string;
  role: UserRole;
  logout: () => void;
  logoutLoading: boolean;
};

export default function AdminSidebar({
  pathname,
  role,
  logout,
  logoutLoading,
}: Props) {
  const menu = getAccessibleAdminMenu(role);

  return (
    <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-col flex-shrink-0 border-r border-sidebar-border">
      <div className="p-6 pb-2 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-bold text-primary-foreground">
          <Newspaper size={18} />
        </div>
        <span className="font-bold text-xl tracking-tight">NewsAdmin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <button
          type="button"
          onClick={logout}
          disabled={logoutLoading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-red-400 transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          {logoutLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
