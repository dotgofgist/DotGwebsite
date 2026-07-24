import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site-url";
import { isPreviewRuntime, isProductionRuntime } from "@/lib/supabase/env";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewRuntime()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: isProductionRuntime() ? "/" : undefined,
      disallow: "/admin/",
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
