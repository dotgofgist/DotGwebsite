import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site-url";
import { isPreviewRuntime, isProductionRuntime } from "@/lib/supabase/env";

// Resolve the canonical URL from the deployed environment, not a cached build
// that may have been produced without the production domain configured.
export const dynamic = "force-dynamic";

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
