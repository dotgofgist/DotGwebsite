"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { requireContentManager } from "@/features/auth/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildStorageObjectPath } from "@/lib/supabase/storage";
import {
  SITE_ASSETS_BUCKET,
  SITE_HERO_MAX_BYTES,
  SITE_LOGO_MAX_BYTES,
} from "@/lib/supabase/storage-constants";
import { validateImageFile } from "@/lib/supabase/storage-validation";

export type SiteImageActionState = {
  status: "idle" | "error";
  message?: string;
};

type SiteAssetKind = "logo" | "hero";

function revalidateSiteImagePaths(): void {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
}

async function removeStorageObject(path: string | null | undefined): Promise<void> {
  if (!path) return;

  const supabase = await createServerSupabaseClient();
  await supabase.storage.from(SITE_ASSETS_BUCKET).remove([path]);
}

async function uploadSiteAsset(
  formData: FormData,
  options: {
    kind: SiteAssetKind;
    fieldName: string;
    maxBytes: number;
  },
): Promise<SiteImageActionState> {
  const manager = await requireContentManager();
  const image = await validateImageFile(formData.get("image"), {
    fieldName: options.fieldName,
    maxBytes: options.maxBytes,
  });

  if (!image.ok) {
    return { status: "error", message: image.message };
  }

  const supabase = await createServerSupabaseClient();
  const existing = await supabase
    .from("site_settings")
    .select("id, logo_path, hero_image_path")
    .eq("id", 1)
    .maybeSingle();

  if (existing.error) {
    return { status: "error", message: "사이트 설정을 불러오지 못했습니다." };
  }

  const nextPath = buildStorageObjectPath([options.kind], image.imageType.extension);
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
      message: `${options.fieldName} 이미지를 업로드하지 못했습니다.`,
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
    ? await supabase.from("site_settings").update(imagePayload).eq("id", 1)
    : await supabase.from("site_settings").insert({
        id: 1,
        name: siteConfig.name,
        title: siteConfig.title,
        description: siteConfig.description,
        short_description: siteConfig.shortDescription,
        ...imagePayload,
      });

  if (save.error) {
    await removeStorageObject(nextPath);
    return {
      status: "error",
      message: `${options.fieldName} 이미지 정보를 저장하지 못했습니다.`,
    };
  }

  await removeStorageObject(previousPath);
  revalidateSiteImagePaths();
  redirect(`/admin/settings?image=${options.kind}`);
}

export async function updateSiteLogoAction(
  _previousState: SiteImageActionState,
  formData: FormData,
): Promise<SiteImageActionState> {
  return uploadSiteAsset(formData, {
    fieldName: "사이트 로고",
    kind: "logo",
    maxBytes: SITE_LOGO_MAX_BYTES,
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

  const update = await supabase
    .from("site_settings")
    .update({ logo_path: null })
    .eq("id", 1);

  if (update.error) {
    redirect("/admin/settings?error=logo");
  }

  await removeStorageObject(existing.data?.logo_path);
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

  const update = await supabase
    .from("site_settings")
    .update({ hero_image_path: null })
    .eq("id", 1);

  if (update.error) {
    redirect("/admin/settings?error=hero");
  }

  await removeStorageObject(existing.data?.hero_image_path);
  revalidateSiteImagePaths();
  redirect("/admin/settings?image=hero-removed");
}
