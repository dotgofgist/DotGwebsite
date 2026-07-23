import type { Metadata } from "next";
import { SocialBanner } from "@/components/shared/social-banner";
import { ActivitySection } from "@/features/home/components/activity-section";
import { ClubSummarySection } from "@/features/home/components/club-summary-section";
import { FeaturedProjectsSection } from "@/features/home/components/featured-projects-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { LatestNoticesSection } from "@/features/home/components/latest-notices-section";
import { RecruitmentCtaSection } from "@/features/home/components/recruitment-cta-section";

export const metadata: Metadata = {
  title: "DotG",
  description: "게임 제작 동아리 DotG의 활동과 프로젝트를 소개합니다.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ClubSummarySection />
      <ActivitySection />
      <FeaturedProjectsSection />
      <LatestNoticesSection />
      <RecruitmentCtaSection />
      <SocialBanner />
    </>
  );
}
