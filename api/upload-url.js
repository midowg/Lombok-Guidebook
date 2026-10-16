// POST { type } -> { url, key }: a short-lived URL the browser PUTs the photo to, straight into R2.
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, BUCKET, PREFIX, missingConfig } from "./_r2.js";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };


export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const missing = missingConfig();
  if (missing.length) return res.status(500).json({ error: `Server is missing: ${missing.join(", ")}` });

  const { type } = req.body || {};
  const ext = TYPES[type];
  if (!ext) return res.status(400).json({ error: "Only JPEG, PNG or WebP photos can be added." });

  const rand = Math.random().toString(36).slice(2, 8);
  const key = `${PREFIX}${Date.now()}-${rand}.${ext}`;
  const url = await getSignedUrl(r2, new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: type }), { expiresIn: 600 });
  res.status(200).json({ url, key });
}
