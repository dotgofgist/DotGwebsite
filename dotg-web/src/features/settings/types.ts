export type SiteSettings = {
  name: string;
  title: string;
  description: string;
  shortDescription: string;
};

export type ContactItem = {
  label: string;
  value: string;
  href?: string;
  description?: string;
};

export type SocialLink = {
  name: string;
  label: string;
  href: string;
  description?: string;
};

export type AdminSiteSettings = SiteSettings & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminContactItem = ContactItem & {
  id: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminSocialLink = {
  id: string;
  platform: string;
  label: string;
  url?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};
