// src/app/(frontend)/layout.tsx
// import FrontendLayout from "@/components/layout/FrontendLayout";
import AdminLayout from "@/components/layout/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
