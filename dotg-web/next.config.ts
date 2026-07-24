import type { NextConfig } from "next";
import { getSupabasePublicEnv } from "./src/lib/supabase/env";

function getSupabaseRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const supabaseEnv = getSupabasePublicEnv();

  if (!supabaseEnv) {
    return [];
  }

  const url = new URL(supabaseEnv.url);

  return [
    {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/storage/v1/object/public/**",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseRemotePatterns(),
  },
};

export default nextConfig;
