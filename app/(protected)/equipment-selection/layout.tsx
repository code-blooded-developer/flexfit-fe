"use client";

import PageTransition from "@/components/PageTransition";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-background pb-32">
        {children}
      </div>
    </PageTransition>
  );
}
