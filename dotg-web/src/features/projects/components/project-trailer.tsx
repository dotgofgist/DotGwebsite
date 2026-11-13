import { parseProjectTrailerUrl } from "../trailer";

type ProjectTrailerProps = {
  url?: string;
  title: string;
  poster?: string;
};

export function ProjectTrailer({ url, title, poster }: ProjectTrailerProps) {
  const trailer = url ? parseProjectTrailerUrl(url) : undefined;
  if (!trailer) return null;

  return (
    <div className="space-y-3">
      <div className="aspect-video overflow-hidden rounded-lg border border-border bg-black">
        {trailer.kind === "youtube" ? (
          <iframe
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={trailer.src}
            title={`${title} 트레일러`}
          />
        ) : (
          <video
            aria-label={`${title} 트레일러`}
            className="h-full w-full object-contain"
            controls
            key={trailer.src}
            playsInline
            poster={poster}
            preload="none"
            src={trailer.src}
          />
        )}
      </div>
      <a
        className="inline-flex text-sm text-primary underline underline-offset-4"
        href={trailer.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        트레일러 새 탭에서 보기
      </a>
    </div>
  );
}
