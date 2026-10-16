import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { currentUser, isStaff } from "@/server/auth";

export const metadata = { title: "Staff sign in" };

export default async function AdminLoginPage() {
  if (isStaff(await currentUser())) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 py-16">
      <div className="w-full max-w-sm bg-paper p-6 md:p-8">
        <Logo className="w-28" />
        <h1 className="display mt-8 text-5xl">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted">For the OSA Techstore team.</p>
        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
