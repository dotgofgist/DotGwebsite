import { ALLOWED_IMAGE_MIME_TYPES } from "./storage-constants.ts";

export type ValidatedImageType = {
  mimeType: (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
  extension: "jpg" | "png" | "webp";
};

export type ImageDimensions = {
  width: number;
  height: number;
};

export type ImageDimensionConstraints = {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxPixels?: number;
};

export type ImageValidationResult =
  | {
      ok: true;
      file: File;
      imageType: ValidatedImageType;
      dimensions: ImageDimensions;
    }
  | { ok: false; message: string };

const allowedMimeTypes = new Set<string>(ALLOWED_IMAGE_MIME_TYPES);

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.slice(start, end));
}

function readUint24LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
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

  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

function parsePngDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 24 || ascii(bytes, 12, 16) !== "IHDR") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    width: view.getUint32(16, false),
    height: view.getUint32(20, false),
  };
}

function parseJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    offset += 2;

    if (marker === 0xd8 || marker === 0xd9) continue;
    if (marker === 0xda) return null;

    const length = (bytes[offset] << 8) + bytes[offset + 1];
    if (length < 2 || offset + length > bytes.length) return null;

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame) {
      return {
        height: (bytes[offset + 3] << 8) + bytes[offset + 4],
        width: (bytes[offset + 5] << 8) + bytes[offset + 6],
      };
    }

    offset += length;
  }

  return null;
}

function parseWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 30 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 12) !== "WEBP") {
    return null;
  }

  const chunk = ascii(bytes, 12, 16);
  if (chunk === "VP8X") {
    return {
      width: readUint24LE(bytes, 24) + 1,
      height: readUint24LE(bytes, 27) + 1,
    };
  }

  if (chunk === "VP8L" && bytes[20] === 0x2f) {
    return {
      width: 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]),
      height: 1 + (((bytes[24] & 0x0f) << 10) | (bytes[23] << 2) | ((bytes[22] & 0xc0) >> 6)),
    };
  }

  if (
    chunk === "VP8 " &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    return {
      width: (bytes[26] | (bytes[27] << 8)) & 0x3fff,
      height: (bytes[28] | (bytes[29] << 8)) & 0x3fff,
    };
  }

  return null;
}

function parseImageDimensions(
  bytes: Uint8Array,
  imageType: ValidatedImageType,
): ImageDimensions | null {
  if (imageType.extension === "png") return parsePngDimensions(bytes);
  if (imageType.extension === "jpg") return parseJpegDimensions(bytes);
  return parseWebpDimensions(bytes);
}

export async function detectImageType(
  file: File,
): Promise<ValidatedImageType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return detectFromSignature(bytes);
}

function maxBytesMessage(fieldName: string, maxBytes: number): string {
  const mb = Math.floor(maxBytes / 1024 / 1024);
  return `${fieldName} image must be ${mb}MB or smaller.`;
}

function validateDimensions(
  fieldName: string,
  dimensions: ImageDimensions,
  constraints: ImageDimensionConstraints | undefined,
): string | null {
  if (!constraints) return null;

  if (constraints.minWidth && dimensions.width < constraints.minWidth) {
    return `${fieldName} image must be at least ${constraints.minWidth}px wide.`;
  }

  if (constraints.minHeight && dimensions.height < constraints.minHeight) {
    return `${fieldName} image must be at least ${constraints.minHeight}px tall.`;
  }

  if (constraints.maxWidth && dimensions.width > constraints.maxWidth) {
    return `${fieldName} image must be ${constraints.maxWidth}px wide or smaller.`;
  }

  if (constraints.maxHeight && dimensions.height > constraints.maxHeight) {
    return `${fieldName} image must be ${constraints.maxHeight}px tall or smaller.`;
  }

  if (constraints.maxPixels && dimensions.width * dimensions.height > constraints.maxPixels) {
    return `${fieldName} image has too many pixels.`;
  }

  return null;
}

export async function validateImageFile(
  value: FormDataEntryValue | null,
  options: {
    maxBytes: number;
    fieldName: string;
    dimensions?: ImageDimensionConstraints;
  },
): Promise<ImageValidationResult> {
  if (!isFile(value)) {
    return { ok: false, message: "Select an image to upload." };
  }

  if (value.size <= 0) {
    return { ok: false, message: "Empty files cannot be uploaded." };
  }

  if (value.size > options.maxBytes) {
    return { ok: false, message: maxBytesMessage(options.fieldName, options.maxBytes) };
  }

  if (!allowedMimeTypes.has(value.type)) {
    return { ok: false, message: "Only JPEG, PNG, or WebP images can be uploaded." };
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  const imageType = detectFromSignature(bytes);

  if (!imageType || imageType.mimeType !== value.type) {
    return { ok: false, message: "The image file type is invalid." };
  }

  const dimensions = parseImageDimensions(bytes, imageType);
  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
    return { ok: false, message: "The image dimensions could not be verified." };
  }

  const dimensionError = validateDimensions(options.fieldName, dimensions, options.dimensions);
  if (dimensionError) return { ok: false, message: dimensionError };

  return { ok: true, file: value, imageType, dimensions };
}
