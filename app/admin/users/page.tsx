"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserRole = "super_admin" | "admin" | "editor" | "reporter";

type IUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

type AuthUser = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

const PAGE_SIZE = 6;

export default function UsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState<IUser | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as UserRole,
    isActive: true,
  });

  const [page, setPage] = useState(1);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" as UserRole,
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Fetch current user error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error("Fetch users error:", error);
      showMessage("error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchCurrentUser(), fetchUsers()]);
    };

    init();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to create user");
        return;
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "admin",
      });

      showMessage("success", "User created successfully");
      await fetchUsers();
    } catch (error) {
      console.error("Create user error:", error);
      showMessage("error", "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const updateUser = async (id: string, payload: Partial<IUser>) => {
    try {
      setUpdatingUserId(id);

      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update user");
        return;
      }

      showMessage("success", "User updated successfully");
      await Promise.all([fetchUsers(), fetchCurrentUser()]);
    } catch (error) {
      console.error("Update user error:", error);
      showMessage("error", "Failed to update user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      const res = await fetch(`/api/users/${deleteTarget._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to delete user");
        return;
      }

      showMessage("success", "User deleted successfully");
      setDeleteTarget(null);
      await Promise.all([fetchUsers(), fetchCurrentUser()]);
    } catch (error) {
      console.error("Delete user error:", error);
      showMessage("error", "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const openEditDialog = (user: IUser) => {
    setEditTarget(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleEditUser = async () => {
    if (!editTarget) return;

    try {
      setEditSaving(true);
      setUpdatingUserId(editTarget._id);

      const payload = {
        name: editForm.name,
        email: editForm.email,
        password: editForm.password,
        role: editForm.role,
        isActive: editForm.isActive,
      };

      const res = await fetch(`/api/users/${editTarget._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage("error", data.message || "Failed to update user");
        return;
      }

      showMessage("success", "User updated successfully");
      setEditTarget(null);
      await Promise.all([fetchUsers(), fetchCurrentUser()]);
    } catch (error) {
      console.error("Edit user error:", error);
      showMessage("error", "Failed to update user");
    } finally {
      setEditSaving(false);
      setUpdatingUserId(null);
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "editor":
        return "Editor";
      case "reporter":
        return "Reporter";
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-blue-100 text-blue-700";
      case "editor":
        return "bg-amber-100 text-amber-700";
      case "reporter":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === "all" || user.role === roleFilter;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isActive) ||
        (statusFilter === "inactive" && !user.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage admin, editor, reporter accounts
        </p>
      </div>

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleCreateUser}
        className="grid grid-cols-1 gap-4 rounded-lg border bg-white p-4 md:grid-cols-4"
      >
        <input
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />

        <input
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          required
        />

        <input
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
          required
        />

        <select
          className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
          value={form.role}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
          }
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="reporter">Reporter</option>
          <option value="super_admin">Super Admin</option>
        </select>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-4"
        >
          {submitting ? "Creating..." : "Create User"}
        </button>
      </form>

      <div className="rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="reporter">Reporter</option>
          </select>

          <select
            className="rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <div className="border-b p-4 font-semibold">
          Users List ({filteredUsers.length})
        </div>

        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No users matched your filters.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3 text-sm font-semibold">Name</th>
                    <th className="p-3 text-sm font-semibold">Email</th>
                    <th className="p-3 text-sm font-semibold">Role</th>
                    <th className="p-3 text-sm font-semibold">Status</th>
                    <th className="p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedUsers.map((user) => {
                    const isSelf = currentUser?.userId === user._id;
                    const isUpdating = updatingUserId === user._id;

                    return (
                      <tr key={user._id} className="border-b last:border-b-0">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {isSelf && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                You
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-sm text-muted-foreground">
                          {user.email}
                        </td>

                        <td className="p-3">
                          <div className="space-y-2">
                            <select
                              className="rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
                              value={user.role}
                              disabled={isSelf || isUpdating}
                              onChange={(e) =>
                                updateUser(user._id, {
                                  role: e.target.value as UserRole,
                                })
                              }
                            >
                              <option value="super_admin">Super Admin</option>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="reporter">Reporter</option>
                            </select>

                            <div>
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(
                                  user.role,
                                )}`}
                              >
                                {getRoleLabel(user.role)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                              user.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                user.isActive ? "bg-green-500" : "bg-red-500"
                              }`}
                            />
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => openEditDialog(user)}
                              disabled={isUpdating}
                              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                updateUser(user._id, {
                                  isActive: !user.isActive,
                                })
                              }
                              disabled={isSelf || isUpdating}
                              className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                user.isActive
                                  ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                  : "border border-green-200 bg-green-50 text-green-600 hover:bg-green-100"
                              }`}
                            >
                              {isUpdating
                                ? "Updating..."
                                : user.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>

                            <button
                              onClick={() => setDeleteTarget(user)}
                              disabled={isSelf || isUpdating}
                              className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>

                          {isSelf && (
                            <p className="mt-1 max-w-[180px] text-xs leading-5 text-muted-foreground">
                              You cannot change or disable your own account.
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update account information, role, status, and password.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Full name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="Email address"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                New Password
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <input
                type="password"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
                  value={editForm.role}
                  disabled={currentUser?.userId === editTarget?._id}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      role: e.target.value as UserRole,
                    }))
                  }
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="reporter">Reporter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:bg-gray-100"
                  value={editForm.isActive ? "active" : "inactive"}
                  disabled={currentUser?.userId === editTarget?._id}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isActive: e.target.value === "active",
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {currentUser?.userId === editTarget?._id && (
              <p className="text-xs leading-5 text-muted-foreground">
                Your role and status cannot be changed from this account.
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setEditTarget(null)}
              disabled={editSaving}
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleEditUser}
              disabled={editSaving}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {editSaving ? "Saving..." : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

//=========================================

// "use client";

// import { useEffect, useState } from "react";

// type UserRole = "super_admin" | "admin" | "editor" | "reporter";

// type IUser = {
//   _id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   isActive: boolean;
// };

// export default function UsersPage() {
//   const [users, setUsers] = useState<IUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "admin" as UserRole,
//   });

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch("/api/users");
//       console.log("get admin", res);
//       const data = await res.json();
//       console.log("get admin2", data);
//       if (res.ok) {
//         setUsers(data.users);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleCreateUser = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const res = await fetch("/api/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         alert(data.message || "Failed to create user");
//         return;
//       }

//       setForm({
//         name: "",
//         email: "",
//         password: "",
//         role: "admin",
//       });

//       fetchUsers();
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const updateUser = async (id: string, payload: Partial<IUser>) => {
//     const res = await fetch(`/api/users/${id}`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       alert(data.message || "Failed to update user");
//       return;
//     }

//     fetchUsers();
//   };

//   return (
//     <div className="space-y-8 p-6">
//       <div>
//         <h1 className="text-2xl font-bold">User Management</h1>
//         <p className="text-sm text-muted-foreground">
//           Create and manage admin, editor, reporter accounts
//         </p>
//       </div>

//       <form
//         onSubmit={handleCreateUser}
//         className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-4"
//       >
//         <input
//           className="rounded border px-3 py-2"
//           placeholder="Name"
//           value={form.name}
//           onChange={(e) =>
//             setForm((prev) => ({ ...prev, name: e.target.value }))
//           }
//           required
//         />
//         <input
//           className="rounded border px-3 py-2"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={(e) =>
//             setForm((prev) => ({ ...prev, email: e.target.value }))
//           }
//           required
//         />
//         <input
//           className="rounded border px-3 py-2"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={(e) =>
//             setForm((prev) => ({ ...prev, password: e.target.value }))
//           }
//           required
//         />
//         <select
//           className="rounded border px-3 py-2"
//           value={form.role}
//           onChange={(e) =>
//             setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
//           }
//         >
//           <option value="admin">Admin</option>
//           <option value="editor">Editor</option>
//           <option value="reporter">Reporter</option>
//           <option value="super_admin">Super Admin</option>
//         </select>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="rounded bg-black px-4 py-2 text-white md:col-span-4"
//         >
//           {submitting ? "Creating..." : "Create User"}
//         </button>
//       </form>

//       <div className="rounded-lg border">
//         <div className="border-b p-4 font-semibold">Users List</div>
//         {loading ? (
//           <p className="p-4">Loading...</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left">
//               <thead>
//                 <tr className="border-b bg-muted/40">
//                   <th className="p-3">Name</th>
//                   <th className="p-3">Email</th>
//                   <th className="p-3">Role</th>
//                   <th className="p-3">Status</th>
//                   <th className="p-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.map((user) => (
//                   <tr key={user._id} className="border-b">
//                     <td className="p-3">{user.name}</td>
//                     <td className="p-3">{user.email}</td>
//                     <td className="p-3">
//                       <select
//                         className="rounded border px-2 py-1"
//                         value={user.role}
//                         onChange={(e) =>
//                           updateUser(user._id, {
//                             role: e.target.value as UserRole,
//                           })
//                         }
//                       >
//                         <option value="super_admin">Super Admin</option>
//                         <option value="admin">Admin</option>
//                         <option value="editor">Editor</option>
//                         <option value="reporter">Reporter</option>
//                       </select>
//                     </td>
//                     <td className="p-3">
//                       {user.isActive ? "Active" : "Inactive"}
//                     </td>
//                     <td className="p-3">
//                       <button
//                         onClick={() =>
//                           updateUser(user._id, { isActive: !user.isActive })
//                         }
//                         className="rounded border px-3 py-1"
//                       >
//                         {user.isActive ? "Deactivate" : "Activate"}
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
