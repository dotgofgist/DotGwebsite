"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createSiteAssetPath,
  isValidSiteAssetPath,
  removeStorageObject,
  type SiteAssetKind,
  warnStorageIntegrity,
} from "@/lib/supabase/storage";
import {
  SITE_ASSETS_BUCKET,
  SITE_HERO_IMAGE_CONSTRAINTS,
  SITE_HERO_MAX_BYTES,
  SITE_LOGO_IMAGE_CONSTRAINTS,
  SITE_LOGO_MAX_BYTES,
} from "@/lib/supabase/storage-constants";
import {
  type ImageDimensionConstraints,
  validateImageFile,
} from "@/lib/supabase/storage-validation";

export type SiteImageActionState = {
  status: "idle" | "error";
  message?: string;
};

function revalidateSiteImagePaths(): void {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

async function uploadSiteAsset(
  formData: FormData,
  options: {
    kind: SiteAssetKind;
    fieldName: string;
    maxBytes: number;
    dimensions: ImageDimensionConstraints;
  },
): Promise<SiteImageActionState> {
  const manager = await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("site_settings")
    .select("id, logo_path, hero_image_path")
    .eq("id", 1)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "Could not load site image state." };
  }

  const image = await validateImageFile(formData.get("image"), {
    fieldName: options.fieldName,
    maxBytes: options.maxBytes,
    dimensions: options.dimensions,
  });

  if (!image.ok) {
    return { status: "error", message: image.message };
  }

  const nextPath = createSiteAssetPath(options.kind, image.imageType.extension);
  const upload = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(nextPath, image.file, {
      cacheControl: "31536000",
      contentType: image.imageType.mimeType,
      upsert: false,
    });

  if (upload.error) {
    return {
      status: "error",
      message: `Could not upload the ${options.fieldName} image.`,
    };
  }

  const previousPath =
    options.kind === "logo"
      ? existing.data?.logo_path
      : existing.data?.hero_image_path;
  const imagePayload =
    options.kind === "logo"
      ? { logo_path: nextPath, updated_by: manager.id }
      : { hero_image_path: nextPath, updated_by: manager.id };

  const save = existing.data
    ? await (previousPath === null || previousPath === undefined
        ? supabase.from("site_settings").update(imagePayload).eq("id", 1).is(
            options.kind === "logo" ? "logo_path" : "hero_image_path",
            null,
          )
        : supabase.from("site_settings").update(imagePayload).eq("id", 1).eq(
            options.kind === "logo" ? "logo_path" : "hero_image_path",
            previousPath,
          )
      )
        .select("id")
        .maybeSingle()
    : await supabase
        .from("site_settings")
        .insert({
          id: 1,
          name: siteConfig.name,
          title: siteConfig.title,
          description: siteConfig.description,
          short_description: siteConfig.shortDescription,
          ...imagePayload,
        })
        .select("id")
        .maybeSingle();

  if (save.error || !save.data) {
    const rollback = await removeStorageObject(supabase, SITE_ASSETS_BUCKET, nextPath);
    if (!rollback.ok) {
      return {
        status: "error",
        message:
          "Image save failed and the uploaded object could not be cleaned up automatically.",
      };
    }

    return {
      status: "error",
      message: save.error
        ? `Could not save the ${options.fieldName} image.`
        : "The site image changed while you were editing. Please retry.",
    };
  }

  if (isValidSiteAssetPath(options.kind, previousPath)) {
    await removeStorageObject(supabase, SITE_ASSETS_BUCKET, previousPath);
  } else if (previousPath) {
    warnStorageIntegrity("Existing site asset path was not removed because it is outside the expected prefix.", {
      bucket: SITE_ASSETS_BUCKET,
      path: previousPath,
      kind: options.kind,
    });
  }

  revalidateSiteImagePaths();
  redirect(`/admin/settings?image=${options.kind}`);
}

export async function updateSiteLogoAction(
  _previousState: SiteImageActionState,
  formData: FormData,
): Promise<SiteImageActionState> {
  return uploadSiteAsset(formData, {
    fieldName: "Site logo",
    kind: "logo",
    maxBytes: SITE_LOGO_MAX_BYTES,
    dimensions: SITE_LOGO_IMAGE_CONSTRAINTS,
  });
}

export async function updateSiteHeroImageAction(
  _previousState: SiteImageActionState,
  formData: FormData,
): Promise<SiteImageActionState> {
  return uploadSiteAsset(formData, {
    fieldName: "Hero",
    kind: "hero",
    maxBytes: SITE_HERO_MAX_BYTES,
    dimensions: SITE_HERO_IMAGE_CONSTRAINTS,
  });
}

export async function removeSiteLogoAction(): Promise<never> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("site_settings")
    .select("id, logo_path")
    .eq("id", 1)
    .maybeSingle();

  if (existing.error) {
    redirect("/admin/settings?error=logo");
  }

  if (!existing.data?.logo_path) {
    revalidateSiteImagePaths();
    redirect("/admin/settings?image=logo-removed");
  }

  const update = await supabase
    .from("site_settings")
    .update({ logo_path: null })
    .eq("id", 1)
    .eq("logo_path", existing.data.logo_path)
    .select("id")
    .maybeSingle();

  if (update.error || !update.data) {
    redirect("/admin/settings?error=logo");
  }

  if (isValidSiteAssetPath("logo", existing.data.logo_path)) {
    await removeStorageObject(supabase, SITE_ASSETS_BUCKET, existing.data.logo_path);
  } else {
    warnStorageIntegrity("Cleared invalid logo path without deleting storage object.", {
      bucket: SITE_ASSETS_BUCKET,
      path: existing.data.logo_path,
      kind: "logo",
    });
  }

  revalidateSiteImagePaths();
  redirect("/admin/settings?image=logo-removed");
}

export async function removeSiteHeroImageAction(): Promise<never> {
  await requireContentManager();
  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("site_settings")
    .select("id, hero_image_path")
    .eq("id", 1)
    .maybeSingle();

  if (existing.error) {
    redirect("/admin/settings?error=hero");
  }

  if (!existing.data?.hero_image_path) {
    revalidateSiteImagePaths();
    redirect("/admin/settings?image=hero-removed");
  }

  const update = await supabase
    .from("site_settings")
    .update({ hero_image_path: null })
    .eq("id", 1)
    .eq("hero_image_path", existing.data.hero_image_path)
    .select("id")
    .maybeSingle();

  if (update.error || !update.data) {
    redirect("/admin/settings?error=hero");
  }

  if (isValidSiteAssetPath("hero", existing.data.hero_image_path)) {
    await removeStorageObject(supabase, SITE_ASSETS_BUCKET, existing.data.hero_image_path);
  } else {
    warnStorageIntegrity("Cleared invalid hero image path without deleting storage object.", {
      bucket: SITE_ASSETS_BUCKET,
      path: existing.data.hero_image_path,
      kind: "hero",
    });
  }

  revalidateSiteImagePaths();
  redirect("/admin/settings?image=hero-removed");
}
