export const PROJECT_IMAGES_BUCKET = "project-images";
export const SITE_ASSETS_BUCKET = "site-assets";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROJECT_THUMBNAIL_MAX_BYTES = 5 * 1024 * 1024;
export const SITE_LOGO_MAX_BYTES = 2 * 1024 * 1024;
export const SITE_HERO_MAX_BYTES = 8 * 1024 * 1024;

export const STORAGE_IMAGE_EXTENSIONS = ["jpg", "png", "webp"] as const;

export const PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS = {
  minWidth: 320,
  minHeight: 180,
  maxWidth: 4096,
  maxHeight: 4096,
  maxPixels: 16_777_216,
} as const;

export const SITE_LOGO_IMAGE_CONSTRAINTS = {
  maxWidth: 2048,
  maxHeight: 2048,
  maxPixels: 4_194_304,
} as const;

export const SITE_HERO_IMAGE_CONSTRAINTS = {
  minWidth: 1280,
  minHeight: 480,
  maxWidth: 6000,
  maxHeight: 4000,
  maxPixels: 24_000_000,
} as const;
