import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/layout/Logo";
import { currentUser, isStaff } from "@/server/auth";

export const metadata = { title: "Staff sign in" };

export default async function AdminLoginPage() {
  if (isStaff(await currentUser())) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl bg-paper-2 p-7 md:p-9">
        <Logo className="w-20 text-ink" />
        <h1 className="mt-8 text-[1.75rem] font-semibold leading-tight tracking-[-0.025em]">Staff sign in</h1>
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
