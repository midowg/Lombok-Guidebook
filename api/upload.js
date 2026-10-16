// POST /api/upload — body is the photo itself (Content-Type image/jpeg|png|webp).
// The browser only talks to this site; the server writes to R2, so the bucket needs no CORS rule.
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, PREFIX, missingConfig } from "./_r2.js";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 4.4 * 1024 * 1024; // Vercel caps request bodies at 4.5 MB

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const missing = missingConfig();
  if (missing.length) return res.status(500).json({ error: `Server is missing: ${missing.join(", ")}` });

  const type = String(req.headers["content-type"] || "").split(";")[0].trim();
  const ext = TYPES[type];
  if (!ext) return res.status(400).json({ error: "Only JPEG, PNG or WebP photos can be added." });

  const body = await readBody(req);
  if (body === null) return res.status(413).json({ error: "This photo is too large. Try a smaller one." });
  if (!body.length) return res.status(400).json({ error: "The photo arrived empty. Please try again." });

  const key = `${PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  try {
    await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: type }));
  } catch (e) {
    console.error("R2 upload failed", e);
    return res.status(502).json({ error: `Storage refused the upload (${e.name || "error"}). Check the R2 keys and bucket name in Vercel.` });
  }
  res.status(200).json({ key });
}
