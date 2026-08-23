import type { MemberProfile } from "./types";

export type ProfileActionState = { status: "idle" | "error"; message?: string; fieldErrors?: Record<string, string> };
export type ProfileFormValues = Omit<MemberProfile, "updatedAt"> & { id: string; updatedAt?: string };
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;
const read = (data: FormData, key: string) => typeof data.get(key) === "string" ? String(data.get(key)).trim() : "";
const safeUrl = (value: string) => { if (!value) return true; try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } };

export function validateProfileFormData(data: FormData): { ok: true; values: ProfileFormValues } | { ok: false; state: ProfileActionState } {
  const id = read(data, "id"); const updatedAt = read(data, "updatedAt");
  const slug = read(data, "slug").toLowerCase(); const name = read(data, "name");
  const position = read(data, "position"); const summary = read(data, "summary"); const details = read(data, "details");
  const imageUrl = read(data, "imageUrl"); const githubUrl = read(data, "githubUrl"); const websiteUrl = read(data, "websiteUrl");
  const skillMap = new Map<string, string>();
  for (const skill of read(data, "skills").split(",").map((value) => value.trim()).filter(Boolean)) {
    const key = skill.toLowerCase();
    if (!skillMap.has(key)) skillMap.set(key, skill);
  }
  const skills = [...skillMap.values()].slice(0, 20);
  const sortOrder = Number.parseInt(read(data, "sortOrder") || "0", 10); const fieldErrors: Record<string, string> = {};
  if (id && !uuidPattern.test(id)) fieldErrors.id = "Invalid profile id.";
  if (id && !updatedAt) fieldErrors.updatedAt = "Refresh before saving again.";
  if (!slugPattern.test(slug) || slug.length > 80) fieldErrors.slug = "Use lowercase letters, numbers, and hyphens.";
  if (!name || name.length > 80) fieldErrors.name = "Name must be 1-80 characters.";
  if (!position || position.length > 80) fieldErrors.position = "Position must be 1-80 characters.";
  if (!summary || summary.length > 240) fieldErrors.summary = "Summary must be 1-240 characters.";
  if (!details || details.length > 5000) fieldErrors.details = "Details must be 1-5000 characters.";
  if ([imageUrl, githubUrl, websiteUrl].some((v) => !safeUrl(v))) fieldErrors.urls = "Links must use http or https.";
  if (!Number.isInteger(sortOrder) || sortOrder < 0) fieldErrors.sortOrder = "Use a non-negative number.";
  if (Object.keys(fieldErrors).length) return { ok: false, state: { status: "error", message: "프로필 입력을 확인해 주세요.", fieldErrors } };
  return { ok: true, values: { id, slug, name, position, summary, details, skills, imageUrl: imageUrl || null, githubUrl: githubUrl || null, websiteUrl: websiteUrl || null, isPublished: data.get("isPublished") === "on", sortOrder, updatedAt: updatedAt || undefined } };
}
