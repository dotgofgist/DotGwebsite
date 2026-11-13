import sharp from "sharp";
import { avatarFileError } from "./avatar.ts";

export async function processPlayerAvatar(file: File): Promise<Buffer> {
  const error = avatarFileError(file);
  if (error) throw new Error(error);
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 16000000, failOn: "warning" });
    const metadata = await image.metadata();
    const expected = { "image/jpeg": "jpeg", "image/png": "png", "image/webp": "webp" }[file.type];
    if (metadata.format !== expected || (metadata.pages ?? 1) > 1) throw new Error("invalid image");
    // Re-encoding removes embedded metadata and rejects corrupt files.
    return await image.rotate().resize(512, 512, { fit: "cover", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
  } catch {
    throw new Error("사진을 읽을 수 없습니다. 1,600만 화소 이하의 정지 이미지(JPG·PNG·WebP)를 선택해 주세요.");
  }
}
