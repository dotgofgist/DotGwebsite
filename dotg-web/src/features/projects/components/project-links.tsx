import { buttonClasses } from "@/components/ui/button";
import type { ProjectLink, ProjectLinkType } from "../types";

const linkTypeLabels: Record<ProjectLinkType, string> = {
  github: "GitHub",
  website: "웹사이트",
  download: "다운로드",
  youtube: "YouTube",
  steam: "Steam",
  itchio: "itch.io",
};

type ProjectLinksProps = {
  links: ProjectLink[];
};

function isConfiguredLink(link: ProjectLink): boolean {
  return link.href.trim().length > 0 && link.href !== "#";
}

export function ProjectLinks({ links }: ProjectLinksProps) {
  const configuredLinks = links.filter(isConfiguredLink);

  if (configuredLinks.length === 0) {
    return (
      <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        아직 연결된 외부 링크가 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {configuredLinks.map((link) => (
        <li key={`${link.type}-${link.href}`}>
          <a
            className={buttonClasses({ variant: "secondary" })}
            href={link.href}
            rel="noreferrer noopener"
            target="_blank"
          >
            {link.label || linkTypeLabels[link.type]} 새 탭에서 열기
          </a>
        </li>
      ))}
    </ul>
  );
}
