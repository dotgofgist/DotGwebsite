import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateNoticeFormData } from "../src/features/notices/validation.ts";
import { validateProjectFormData } from "../src/features/projects/validation.ts";
import { validateProfileFormData } from "../src/features/profiles/validation.ts";
import {
  validateContactItemFormData,
  validateSiteSettingsFormData,
  validateSocialLinkFormData,
} from "../src/features/settings/validation.ts";

function form(entries: Record<string, string | boolean>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value === true) formData.set(key, "on");
    else if (value !== false) formData.set(key, value);
  }
  return formData;
}

describe("admin validation", () => {
  it("normalizes profile slugs and skills", () => {
    const result = validateProfileFormData(form({ name: "Doyun", slug: "DOYUN-KIM", position: "Developer", summary: "Intro", details: "Details", skills: "React, react, Supabase", isPublished: true }));
    assert.equal(result.ok, true);
    if (result.ok) { assert.equal(result.values.slug, "doyun-kim"); assert.deepEqual(result.values.skills, ["React", "Supabase"]); }
  });

  it("rejects unsafe profile links", () => {
    const result = validateProfileFormData(form({ name: "Doyun", slug: "doyun", position: "Developer", summary: "Intro", details: "Details", websiteUrl: "javascript:alert(1)" }));
    assert.equal(result.ok, false);
  });
  it("normalizes project slug, tags, members, and duplicate links", () => {
    const result = validateProjectFormData(
      form({
        title: "My Project",
        slug: "MY-PROJECT",
        summary: "Short summary",
        description: "Longer description",
        status: "planning",
        publicationStatus: "draft",
        tags: "Unity, unity, Puzzle",
        members: "Alice|Lead\n alice | lead \nBob|Artist",
        links: "website|Home|https://example.test\nwebsite|Home again|https://example.test",
      }),
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.values.slug, "my-project");
      assert.deepEqual(result.values.tags, ["Unity", "Puzzle"]);
      assert.equal(result.values.members.length, 2);
      assert.equal(result.values.links.length, 1);
    }
  });

  it("rejects invalid project URLs and stale edit submissions without a token", () => {
    const result = validateProjectFormData(
      form({
        id: "11111111-1111-4111-8111-111111111111",
        title: "My Project",
        slug: "my-project",
        summary: "Short summary",
        description: "Longer description",
        status: "planning",
        publicationStatus: "draft",
        links: "website|Bad|javascript:alert(1)",
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.state.fieldErrors?.links !== undefined, true);
      assert.equal(result.state.fieldErrors?.updatedAt !== undefined, true);
    }
  });

  it("normalizes notice slug and requires edit concurrency token", () => {
    const result = validateNoticeFormData(
      form({
        id: "11111111-1111-4111-8111-111111111111",
        title: "Notice",
        slug: "NOTICE-SLUG",
        summary: "Summary",
        content: "Content",
        publicationStatus: "draft",
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.state.fieldErrors?.updatedAt !== undefined, true);
    }
  });

  it("rejects stale site settings submissions without updatedAt", () => {
    const result = validateSiteSettingsFormData(
      form({
        name: "DotG",
        title: "DotG site",
        description: "Description",
        shortDescription: "Short",
      }),
    );

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.state.fieldErrors?.updatedAt !== undefined, true);
  });

  it("keeps contact and social URL policies distinct", () => {
    const contact = validateContactItemFormData(
      form({
        label: "Email",
        value: "hello@example.test",
        href: "mailto:hello@example.test",
      }),
    );
    const social = validateSocialLinkFormData(
      form({
        platform: "github",
        label: "GitHub",
        url: "mailto:hello@example.test",
        isActive: true,
      }),
    );

    assert.equal(contact.ok, true);
    assert.equal(social.ok, false);
  });
});
