export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg border p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
}
