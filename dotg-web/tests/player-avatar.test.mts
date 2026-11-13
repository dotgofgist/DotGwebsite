import assert from "node:assert/strict";
import { test } from "node:test";
import sharp from "sharp";
import { processPlayerAvatar } from "../src/features/game-social/avatar-processing.ts";

test("uploaded photos are decoded, resized and stripped of metadata", async () => {
  const source = await sharp({ create: { width: 900, height: 600, channels: 3, background: "#33cc99" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const result = await processPlayerAvatar(new File([new Uint8Array(source)], "portrait.jpg", { type: "image/jpeg" }));
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format,"webp");
  assert.equal(metadata.width,512); assert.equal(metadata.height,512);
  assert.equal(metadata.exif,undefined); assert.equal(metadata.orientation,undefined);
});

test("spoofed, corrupt, empty and oversized uploads cannot become profile pictures", async () => {
  for (const file of [
    new File(["<svg onload='alert(1)'></svg>"],"fake.png",{type:"image/png"}),
    new File(["text"],"photo.svg",{type:"image/svg+xml"}),
    new File([],"empty.jpg",{type:"image/jpeg"}),
    new File([new Uint8Array(2*1024*1024+1)],"large.jpg",{type:"image/jpeg"}),
  ]) await assert.rejects(processPlayerAvatar(file));
  const png = await sharp({ create: { width: 32, height: 32, channels: 3, background: "red" } }).png().toBuffer();
  await assert.rejects(processPlayerAvatar(new File([new Uint8Array(png)],"spoofed.jpg",{type:"image/jpeg"})));
});
