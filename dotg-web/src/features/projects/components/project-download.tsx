"use client";

import { useId, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import type { ProjectLink, ProjectStatus } from "../types";

type ProjectDownloadProps = {
  links: ProjectLink[];
  status: ProjectStatus;
};

function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4" />
    </svg>
  );
}

export function ProjectDownload({ links, status }: ProjectDownloadProps) {
  const tooltipId = useId();
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const downloadLinks = links.filter(
    (link) =>
      link.type === "download" &&
      link.href.trim().length > 0 &&
      link.href.trim() !== "#",
  );

  if (downloadLinks.length > 0) {
    return downloadLinks.map((link) => (
      <a
        className={buttonClasses({ size: "lg", className: "!text-primary-foreground" })}
        href={link.href.trim()}
        key={link.href}
        rel="noreferrer noopener"
        target="_blank"
      >
        <DownloadIcon />
        {link.label.trim() || "다운로드"}
        <span className="sr-only"> (새 탭에서 열기)</span>
      </a>
    ));
  }

  return (
    <div
      className="group/download relative w-fit"
      onFocus={() => setTooltipDismissed(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setTooltipDismissed(true);
        }
      }}
      onMouseEnter={() => setTooltipDismissed(false)}
    >
      <button
        aria-describedby={tooltipId}
        aria-disabled="true"
        className="inline-flex h-12 !cursor-not-allowed items-center justify-center gap-2 rounded-md border border-neutral-300 bg-neutral-200 px-5 text-base font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
        type="button"
      >
        <DownloadIcon />
        다운로드
      </button>
      <span
        className={`invisible absolute bottom-full left-0 z-10 w-max max-w-[calc(100vw-3rem)] pb-2 opacity-0 transition-opacity ${
          tooltipDismissed
            ? ""
            : "group-hover/download:visible group-hover/download:opacity-100 group-focus-within/download:visible group-focus-within/download:opacity-100"
        }`}
        id={tooltipId}
        role="tooltip"
      >
        <span className="block rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow-lg dark:bg-neutral-100 dark:text-neutral-900">
          {status === "released" || status === "archived"
            ? "다운로드 파일을 준비 중입니다"
            : "출시되지 않은 게임입니다"}
        </span>
      </span>
    </div>
  );
}
