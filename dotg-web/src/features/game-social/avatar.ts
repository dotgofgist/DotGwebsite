export const PLAYER_AVATAR_BUCKET = "player-avatars";
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function avatarFileError(file: File): string | null {
  if (!file.size || file.size > MAX_AVATAR_BYTES) return "프로필 사진은 2MB 이하의 이미지로 선택해 주세요.";
  if (!AVATAR_MIME_TYPES.includes(file.type)) return "JPG, PNG, WebP 사진만 사용할 수 있습니다.";
  return null;
}
