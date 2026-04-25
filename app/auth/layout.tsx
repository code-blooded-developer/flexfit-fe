"use client";

import PageTransition from "@/components/PageTransition";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-14 pb-10 relative overflow-hidden">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
