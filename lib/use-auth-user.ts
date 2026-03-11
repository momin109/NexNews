"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/admin-config";

type AuthUser = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export function useAuthUser() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user as AuthUser;
    } catch (error) {
      console.error("Fetch current user failed:", error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();

    const handleFocus = () => {
      fetchMe();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchMe();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchMe]);

  const logout = async () => {
    try {
      setLogoutLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return {
    user,
    loading,
    logoutLoading,
    logout,
    revalidateUser: fetchMe,
  };
}
