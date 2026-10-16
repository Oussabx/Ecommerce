import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/account/AuthShell";
import { ResetForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

export default function ResetPage() {
  return (
    <AuthShell title="New password" kicker="Account — Recovery" intro="Choose a new password. Reset links expire after one hour and work once.">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
