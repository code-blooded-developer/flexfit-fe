import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import AppProviders from "./provider";
import "./globals.css";

/**
 * Fonts are vendored instead of fetched from Google at build time. `next/font/google`
 * downloads on first compile, so a machine without egress to fonts.gstatic.com fails
 * to start the app at all. Both files are the latin-subset variable cuts (OFL).
 */
const spaceGrotesk = localFont({
  src: "../public/fonts/space-grotesk-latin-var.woff2",
  variable: "--font-space-grotesk",
  weight: "300 700",
  display: "swap",
});

const inter = localFont({
  src: "../public/fonts/inter-latin-var.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlexFit — Train Smarter. Get Stronger.",
  description:
    "Premium fitness tracking. Train smarter, get stronger with FlexFit.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-72x72.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#121212",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
