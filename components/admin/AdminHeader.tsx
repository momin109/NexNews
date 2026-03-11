"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Newspaper, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  pageTitle: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  logout: () => void;
  logoutLoading: boolean;
};

export default function AdminHeader({
  pageTitle,
  user,
  logout,
  logoutLoading,
}: Props) {
  const initials =
    user.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      <div className="md:hidden font-bold text-lg flex items-center gap-2">
        <Newspaper size={18} className="text-primary" />
        NewsAdmin
      </div>

      <div className="hidden md:block">
        <h2 className="text-lg font-semibold text-foreground capitalize">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-primary hover:underline font-medium hidden sm:block"
        >
          View Live Site
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-accent p-1.5 rounded-full transition-colors outline-none">
              <Avatar className="w-8 h-8 border">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown
                size={14}
                className="text-muted-foreground hidden sm:block"
              />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground capitalize pt-1">
                  Role: {user.role.replace(/_/g, " ")}
                </p>
              </div>
            </DropdownMenuLabel>

            {/* <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/admin/settings"
                className="cursor-pointer flex items-center"
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator /> */}

            <DropdownMenuItem
              onClick={logout}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
