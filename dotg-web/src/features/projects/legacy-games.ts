import games from "../../../content/legacy-games.json";
import type { Project } from "./types";

// Real archived games for local preview. Production continues to use Supabase.
// This is the catalog registration date, not an inferred release date.
export const legacyGames: Project[] = games.map((game) => ({
  id: `legacy-${game.slug}`,
  slug: game.slug,
  title: game.title,
  summary: game.summary,
  description: game.description,
  thumbnailUrl: game.cover,
  status: "released",
  tags: game.tags,
  featured: false,
  members: game.members,
  links: [{
    type: "download",
    label: `Windows v${game.version} 다운로드`,
    href: game.downloadUrl,
  }],
  createdAt: "2026-11-20",
}));
