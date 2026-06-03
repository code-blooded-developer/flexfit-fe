"use client";

import PageTransition from "@/components/PageTransition";

import BottomNav from "./_components/BottomNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <PageTransition>
        {children}
      </PageTransition>
      <BottomNav />
    </div>
  );
}
