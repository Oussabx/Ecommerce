import type { Metadata } from "next";
import { AuthShell } from "@/components/account/AuthShell";
import { ForgotForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Reset password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset password" kicker="Account — Recovery" intro="Enter the email you signed up with and we'll help you set a new password.">
      <ForgotForm />
    </AuthShell>
  );
}
