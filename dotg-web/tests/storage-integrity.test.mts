import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createProjectThumbnailPath,
  createSiteAssetPath,
  getPublicStorageUrl,
  isValidProjectThumbnailPath,
  isValidSiteAssetPath,
  isValidStoragePathForBucket,
} from "../src/lib/supabase/storage.ts";
import {
  PROJECT_IMAGES_BUCKET,
  PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
  SITE_ASSETS_BUCKET,
} from "../src/lib/supabase/storage-constants.ts";
import { validateImageFile } from "../src/lib/supabase/storage-validation.ts";

const projectId = "11111111-1111-4111-8111-111111111111";

function pngFile(width: number, height: number, type = "image/png"): File {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width, false);
  view.setUint32(20, height, false);
  return new File([bytes], "image.png", { type });
}

describe("Storage image paths", () => {
  it("creates and accepts scoped project thumbnail paths", () => {
    const path = createProjectThumbnailPath(projectId, "png");

    assert.equal(isValidProjectThumbnailPath(projectId, path), true);
    assert.equal(isValidStoragePathForBucket(PROJECT_IMAGES_BUCKET, path), true);
    assert.equal(isValidProjectThumbnailPath(projectId, `${SITE_ASSETS_BUCKET}/${path}`), false);
    assert.equal(isValidProjectThumbnailPath(projectId, `/${path}`), false);
    assert.equal(isValidProjectThumbnailPath(projectId, path.replace(projectId, "22222222-2222-4222-8222-222222222222")), false);
  });

  it("creates and accepts only scoped site asset paths", () => {
    const logoPath = createSiteAssetPath("logo", "webp");
    const heroPath = createSiteAssetPath("hero", "jpg");

    assert.equal(isValidSiteAssetPath("logo", logoPath), true);
    assert.equal(isValidSiteAssetPath("hero", heroPath), true);
    assert.equal(isValidSiteAssetPath("logo", heroPath), false);
    assert.equal(isValidStoragePathForBucket(SITE_ASSETS_BUCKET, logoPath), true);
    assert.equal(isValidStoragePathForBucket(SITE_ASSETS_BUCKET, `https://example.com/${logoPath}`), false);
  });

  it("does not build public URLs for malformed object paths", () => {
    const calls: string[] = [];
    const client = {
      storage: {
        from(bucket: string) {
          calls.push(bucket);
          return {
            getPublicUrl(path: string) {
              calls.push(path);
              return { data: { publicUrl: `https://storage.example/${bucket}/${path}` } };
            },
          };
        },
      },
    };

    assert.equal(getPublicStorageUrl(client as never, PROJECT_IMAGES_BUCKET, "https://cdn.example/a.png"), undefined);
    assert.equal(calls.length, 0);

    const path = createProjectThumbnailPath(projectId, "jpg");
    assert.match(getPublicStorageUrl(client as never, PROJECT_IMAGES_BUCKET, path) ?? "", /project-images/);
    assert.deepEqual(calls, [PROJECT_IMAGES_BUCKET, path]);
  });
});

describe("Storage image validation", () => {
  it("verifies image signatures and dimensions", async () => {
    const result = await validateImageFile(pngFile(640, 360), {
      fieldName: "Project thumbnail",
      maxBytes: 1024,
      dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.dimensions, { width: 640, height: 360 });
      assert.equal(result.imageType.extension, "png");
    }
  });

  it("rejects tiny thumbnails and mismatched MIME types", async () => {
    const tiny = await validateImageFile(pngFile(100, 100), {
      fieldName: "Project thumbnail",
      maxBytes: 1024,
      dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
    });
    assert.equal(tiny.ok, false);

    const mismatched = await validateImageFile(pngFile(640, 360, "image/jpeg"), {
      fieldName: "Project thumbnail",
      maxBytes: 1024,
      dimensions: PROJECT_THUMBNAIL_IMAGE_CONSTRAINTS,
    });
    assert.equal(mismatched.ok, false);
  });
});
