export type RecruitmentStatus = "upcoming" | "open" | "closed" | "always";

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
