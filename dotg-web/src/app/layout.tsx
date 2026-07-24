import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl, getSiteMetadataBase } from "@/config/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteMetadataBase(),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: getCanonicalUrl("/"),
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "DotG",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
