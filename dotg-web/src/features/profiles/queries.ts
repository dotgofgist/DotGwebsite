import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MemberProfile } from "./types";
import type { Database } from "@/lib/supabase/database.types";
import { shouldUsePublicMockFallback } from "@/lib/supabase/env";
import { profileMocks } from "./mock-data";

type ProfileRow = Database["public"]["Tables"]["member_profiles"]["Row"];
const map = (row: ProfileRow): MemberProfile => ({ id: row.id, slug: row.slug, name: row.name, position: row.position, summary: row.summary, details: row.details, skills: row.skills, imageUrl: row.image_url, githubUrl: row.github_url, websiteUrl: row.website_url, isPublished: row.is_published, sortOrder: row.sort_order, updatedAt: row.updated_at });
export async function getProfiles(includeDrafts = false): Promise<MemberProfile[]> { if (!includeDrafts && shouldUsePublicMockFallback("public profiles")) return profileMocks; const db = await createServerSupabaseClient(); let query = db.from("member_profiles").select("*").order("sort_order").order("name"); if (!includeDrafts) query = query.eq("is_published", true); const { data, error } = await query; if (error) throw new Error("Unable to load profiles."); return (data ?? []).map(map); }
export async function getProfileBySlug(slug: string): Promise<MemberProfile | null> { if (shouldUsePublicMockFallback("public profile detail")) return profileMocks.find((profile) => profile.slug === slug) ?? null; const db = await createServerSupabaseClient(); const { data, error } = await db.from("member_profiles").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); if (error) throw new Error("Unable to load profile."); return data ? map(data) : null; }
export async function getAdminProfile(id: string): Promise<MemberProfile | null> { const db = await createServerSupabaseClient(); const { data, error } = await db.from("member_profiles").select("*").eq("id", id).maybeSingle(); if (error) throw new Error("Unable to load profile."); return data ? map(data) : null; }
