import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { LoginForm } from "@/components/account/AuthForms";
import { currentUser } from "@/server/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await currentUser()) redirect("/account");
  return (
    <AuthShell title="Sign in" kicker="Account — 01" intro="Track orders, save addresses and keep your wishlist in one place. You can always check out as a guest.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
