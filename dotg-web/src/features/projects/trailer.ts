export type ProjectTrailerSource = {
  kind: "youtube" | "video";
  url: string;
  src: string;
};

const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function parseProjectTrailerUrl(value: string): ProjectTrailerSource | undefined {
  const input = value.trim();
  if (!input || input.length > 2048) return undefined;

  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;

    if (youtubeHosts.has(url.hostname) || url.hostname === "youtu.be") {
      if (url.port) return undefined;
      let videoId: string | undefined;
      if (url.hostname === "youtu.be") {
        videoId = /^\/([\w-]{11})\/?$/.exec(url.pathname)?.[1];
      } else if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? undefined;
      } else {
        videoId = /^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/.exec(url.pathname)?.[1];
      }
      if (!videoId || !/^[\w-]{11}$/.test(videoId)) return undefined;

      return {
        kind: "youtube",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        src: `https://www.youtube-nocookie.com/embed/${videoId}`,
      };
    }

    if (/\.(mp4|webm)$/i.test(url.pathname)) {
      return { kind: "video", url: url.href, src: url.href };
    }
  } catch {
    // Invalid or unsupported URLs never reach a player.
  }
  return undefined;
}
