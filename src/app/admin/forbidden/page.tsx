import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="container-x py-20">
      <p className="label text-muted">Admin</p>
      <h1 className="display mt-3 text-6xl">No access.</h1>
      <p className="mt-4 max-w-md text-muted">Your account doesn&apos;t have permission to open this part of the admin. Ask an administrator to give you staff access.</p>
      <div className="mt-6 flex gap-2">
        <Link href="/" className="btn btn-primary">
          Back to the store
        </Link>
        <Link href="/admin/login" className="btn btn-outline">
          Sign in as staff
        </Link>
      </div>
    </div>
  );
}
