"use client";

import { Navbar } from "@/components/layout/navbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { SubscriptionBanner } from "@/components/layout/subscription-banner";
import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen w-full flex flex-col items-center bg-primary md:bg-secondary p-0 md:p-4">
        <Navbar />
        <div className="w-full max-w-7xl">
          <EmailVerificationBanner />
          <SubscriptionBanner />
        </div>
        {children}
      </main>
    </ProtectedRoute>
  );
}