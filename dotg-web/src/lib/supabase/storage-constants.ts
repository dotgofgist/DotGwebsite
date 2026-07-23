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
