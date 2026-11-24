// Extracts the white AUTOMATICA logo from the supplied artwork
// (public/assets/logo/source/automatica-logo-source.jpg) into transparent assets.
//   node scripts/extract-logo.mjs
import sharp from "sharp";

const SRC = "public/assets/logo/source/automatica-logo-source.jpg";
const OUT = "public/assets/logo";
const CROP = { left: 420, top: 340, width: 1080, height: 350 }; // generous box around the logo

const { data, info } = await sharp(SRC).extract(CROP).raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h, channels: ch } = info;
const rgba = Buffer.alloc(w * h * 4);
let minX = w, minY = h, maxX = 0, maxY = 0;
for (let i = 0; i < w * h; i++) {
  const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  // White logo pixels: very bright and near-neutral. Smooth ramp keeps anti-aliased edges.
  let a = Math.min(1, Math.max(0, (lum - 150) / (235 - 150)));
  if (sat > 70) a *= Math.max(0, 1 - (sat - 70) / 50);
  const A = Math.round(a * 255);
  rgba[i * 4] = 255; rgba[i * 4 + 1] = 255; rgba[i * 4 + 2] = 255; rgba[i * 4 + 3] = A;
  if (A > 128) {
    const x = i % w, y = (i / w) | 0;
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
}
const pad = 6;
const box = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: Math.min(w, maxX + pad + 1) - Math.max(0, minX - pad), height: Math.min(h, maxY + pad + 1) - Math.max(0, minY - pad) };
const logo = sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).extract(box);
const logoPng = await logo.png().toBuffer();
await sharp(logoPng).png({ compressionLevel: 9 }).toFile(`${OUT}/automatica-logo.png`);
await sharp(logoPng).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}/automatica-logo.webp`);

// Door symbol (mark): left part of the lockup, up to the door's right frame.
const markW = Math.round(box.height * 0.88);
const markPng = await sharp(logoPng).extract({ left: 0, top: 0, width: Math.min(markW, box.width), height: box.height }).png().toBuffer();
await sharp(markPng).toFile(`${OUT}/automatica-mark.png`);

// Logo on brand blue (for bright scenes), and square icons.
const BLUE = "#0B5ED7";
const bw = box.width + 160, bh = box.height + 120;
await sharp({ create: { width: bw, height: bh, channels: 4, background: BLUE } })
  .composite([{ input: logoPng, left: 80, top: 60 }]).png().toFile(`${OUT}/automatica-logo-blue.png`);
const icon = async (size, file) => {
  const inner = Math.round(size * 0.7);
  const m = await sharp(markPng).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  const off = Math.round((size - inner) / 2);
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B5ED7"/><stop offset="1" stop-color="#0A2F6B"/></linearGradient></defs><rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#g)"/></svg>`);
  await sharp(bg).composite([{ input: m, left: off, top: off }]).png().toFile(file);
};
await icon(512, "app/icon.png");
await icon(180, "app/apple-icon.png");

// Open Graph: the supplied artwork itself, cropped to 1200×630.
await sharp(SRC).resize(1200, 675).extract({ left: 0, top: 22, width: 1200, height: 630 }).jpeg({ quality: 86, mozjpeg: true }).toFile("public/og.jpg");
console.log("logo box", box, "aspect", (box.width / box.height).toFixed(4));
