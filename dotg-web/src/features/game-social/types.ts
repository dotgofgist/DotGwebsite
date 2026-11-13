export type PublicPlayer = { id: string; handle: string; display_name: string; bio: string; avatar: string; avatar_path: string | null };
export type PlayerProfile = PublicPlayer & { real_name: string };
export type Relationship = PublicPlayer & { user_id: string; status: "pending" | "accepted"; incoming: boolean };
export type PlayerSearchResult = PublicPlayer & { relationship_status: "pending" | "accepted" | null; incoming: boolean };
export type GameRoom = { id: string; title: string; endpoint: string; transport: "direct_udp" | "eos_p2p"; expires_at: string };
export type GameInvite = { id: string; session_id: string; title: string; host_name: string; status: "pending" | "accepted"; expires_at: string };
export type SocialDashboard = {
  profile: PlayerProfile | null;
  relationships: Relationship[];
  blocks: { user_id: string; handle: string; display_name: string }[];
  rooms: GameRoom[];
  invites: GameInvite[];
};
