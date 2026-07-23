import type { Database } from "@/lib/supabase/database.types";

export type RecruitmentStatus =
  Database["public"]["Enums"]["recruitment_status"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];

export type RecruitmentSchedule = {
  startsAt?: string;
  endsAt?: string;
};

export type RecruitmentStep = {
  title: string;
  description: string;
};

export type RecruitmentContact = {
  label: string;
  value: string;
  href?: string;
};

export type Recruitment = {
  id: string;
  title: string;
  summary: string;
  status: RecruitmentStatus;
  target: string[];
  qualifications: string[];
  activities: string[];
  schedule: RecruitmentSchedule;
  process: RecruitmentStep[];
  applicationUrl?: string;
  applicationLabel: string;
  contact?: RecruitmentContact;
  updatedAt: string;
};

export type AdminRecruitment = Recruitment & {
  publicationStatus: ContentStatus;
  isCurrent: boolean;
  publishedAt?: string;
  createdAt: string;
  stepCount?: number;
};
