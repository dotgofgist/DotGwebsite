import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function getPublicStorageUrl(
  client: SupabaseClient<Database>,
  bucket: string,
  path: string | null | undefined,
): string | undefined {
  if (!path) {
    return undefined;
  }

  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function buildStorageObjectPath(
  parts: string[],
  extension: string,
): string {
  return `${parts.join("/")}/${crypto.randomUUID()}.${extension}`;
}
