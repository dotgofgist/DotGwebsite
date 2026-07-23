import { ALLOWED_IMAGE_MIME_TYPES } from "./storage-constants";

export type ValidatedImageType = {
  mimeType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
  extension: "jpg" | "png" | "webp";
};

export type ImageValidationResult =
  | { ok: true; file: File; imageType: ValidatedImageType }
  | { ok: false; message: string };

const allowedMimeTypes = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function detectFromSignature(bytes: Uint8Array): ValidatedImageType | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { mimeType: "image/png", extension: "png" };
  }

  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));

  if (riff === "RIFF" && webp === "WEBP") {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

export async function detectImageType(
  file: File,
): Promise<ValidatedImageType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  return detectFromSignature(bytes);
}

function maxBytesMessage(fieldName: string, maxBytes: number): string {
  const mb = Math.floor(maxBytes / 1024 / 1024);

  return `${fieldName} 이미지는 ${mb}MB 이하만 업로드할 수 있습니다.`;
}

export async function validateImageFile(
  value: FormDataEntryValue | null,
  options: {
    maxBytes: number;
    fieldName: string;
  },
): Promise<ImageValidationResult> {
  if (!isFile(value)) {
    return { ok: false, message: "업로드할 이미지를 선택해 주세요." };
  }

  if (value.size <= 0) {
    return { ok: false, message: "비어 있는 파일은 업로드할 수 없습니다." };
  }

  if (value.size > options.maxBytes) {
    return {
      ok: false,
      message: maxBytesMessage(options.fieldName, options.maxBytes),
    };
  }

  if (!allowedMimeTypes.has(value.type)) {
    return {
      ok: false,
      message: "JPEG, PNG 또는 WebP 이미지만 업로드할 수 있습니다.",
    };
  }

  const imageType = await detectImageType(value);

  if (!imageType || imageType.mimeType !== value.type) {
    return { ok: false, message: "파일 형식이 올바르지 않습니다." };
  }

  return { ok: true, file: value, imageType };
}
