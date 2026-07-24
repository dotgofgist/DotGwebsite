import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";
import {
  PROJECT_IMAGES_BUCKET,
  SITE_ASSETS_BUCKET,
  STORAGE_IMAGE_EXTENSIONS,
} from "./storage-constants.ts";
import type { ValidatedImageType } from "./storage-validation.ts";

export type SiteAssetKind = "logo" | "hero";
export type StorageBucket = typeof PROJECT_IMAGES_BUCKET | typeof SITE_ASSETS_BUCKET;
export type StorageImageExtension = (typeof STORAGE_IMAGE_EXTENSIONS)[number];

type StorageRemoveResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; message: string };

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const objectNamePattern = /^[0-9a-f-]+\.(jpg|png|webp)$/i;
const storageImageExtensions = new Set<string>(STORAGE_IMAGE_EXTENSIONS);

function isValidUuid(value: string): boolean {
  return uuidPattern.test(value);
}

function isValidExtension(extension: string): extension is StorageImageExtension {
  return storageImageExtensions.has(extension);
}

function normalizeStorageObjectPath(path: string | null | undefined): string | null {
  if (!path) return null;

  const trimmed = path.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 512 ||
    trimmed.includes("\\") ||
    trimmed.includes("//") ||
    trimmed.includes("..") ||
    trimmed.startsWith("/") ||
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith(`${PROJECT_IMAGES_BUCKET}/`) ||
    trimmed.startsWith(`${SITE_ASSETS_BUCKET}/`)
  ) {
    return null;
  }

  return trimmed;
}

function makeObjectName(extension: string): string {
  if (!isValidExtension(extension)) {
    throw new Error(`Unsupported storage image extension: ${extension}`);
  }

  return `${crypto.randomUUID()}.${extension}`;
}

export function createProjectThumbnailPath(
  projectId: string,
  extension: ValidatedImageType["extension"],
): string {
  if (!isValidUuid(projectId)) {
    throw new Error("Invalid project id for project thumbnail path.");
  }

  return `${projectId}/thumbnail/${makeObjectName(extension)}`;
}

export function createSiteAssetPath(
  kind: SiteAssetKind,
  extension: ValidatedImageType["extension"],
): string {
  return `${kind}/${makeObjectName(extension)}`;
}

export function isValidProjectThumbnailPath(
  projectId: string,
  path: string | null | undefined,
): path is string {
  const normalized = normalizeStorageObjectPath(path);
  if (!normalized || !isValidUuid(projectId)) return false;

  const parts = normalized.split("/");
  return (
    parts.length === 3 &&
    parts[0] === projectId &&
    parts[1] === "thumbnail" &&
    objectNamePattern.test(parts[2])
  );
}

export function isValidSiteAssetPath(
  kind: SiteAssetKind,
  path: string | null | undefined,
): path is string {
  const normalized = normalizeStorageObjectPath(path);
  if (!normalized) return false;

  const parts = normalized.split("/");
  return parts.length === 2 && parts[0] === kind && objectNamePattern.test(parts[1]);
}

export function isValidStoragePathForBucket(
  bucket: string,
  path: string | null | undefined,
): path is string {
  const normalized = normalizeStorageObjectPath(path);
  if (!normalized) return false;

  if (bucket === PROJECT_IMAGES_BUCKET) {
    const parts = normalized.split("/");
    return (
      parts.length === 3 &&
      isValidUuid(parts[0]) &&
      parts[1] === "thumbnail" &&
      objectNamePattern.test(parts[2])
    );
  }

  if (bucket === SITE_ASSETS_BUCKET) {
    return isValidSiteAssetPath("logo", normalized) || isValidSiteAssetPath("hero", normalized);
  }

  return false;
}

export function getPublicStorageUrl(
  client: SupabaseClient<Database>,
  bucket: string,
  path: string | null | undefined,
): string | undefined {
  if (!isValidStoragePathForBucket(bucket, path)) {
    return undefined;
  }

  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export function warnStorageIntegrity(
  message: string,
  context: Record<string, string | null | undefined>,
): void {
  console.warn("[DotG Storage]", message, context);
}

export async function removeStorageObject(
  client: SupabaseClient<Database>,
  bucket: StorageBucket,
  path: string | null | undefined,
): Promise<StorageRemoveResult> {
  if (!path) return { ok: true, skipped: true };

  if (!isValidStoragePathForBucket(bucket, path)) {
    warnStorageIntegrity("Skipped removal for invalid storage path.", { bucket, path });
    return { ok: true, skipped: true };
  }

  const result = await client.storage.from(bucket).remove([path]);
  if (result.error) {
    warnStorageIntegrity("Storage object removal failed.", {
      bucket,
      path,
      reason: result.error.message,
    });
    return { ok: false, message: result.error.message };
  }

  return { ok: true };
}
