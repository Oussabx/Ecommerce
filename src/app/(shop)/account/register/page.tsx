import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/AuthShell";
import { RegisterForm } from "@/components/account/AuthForms";
import { currentUser } from "@/server/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function RegisterPage() {
  if (await currentUser()) redirect("/account");
  return (
    <AuthShell title="Join OSA" kicker="Account — New" intro="One account for order history, saved delivery addresses and faster checkout. We never share your details.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
