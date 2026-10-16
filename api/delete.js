// POST /api/delete { key } — removes one photo from the album. Only reachable from the admin /upload page.
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, BUCKET, PREFIX, missingConfig } from "./_r2.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  const missing = missingConfig();
  if (missing.length) return res.status(500).json({ error: `Server is missing: ${missing.join(", ")}` });

  const { key } = req.body || {};
  if (typeof key !== "string" || !key.startsWith(PREFIX) || !/^album\/[\w.-]+$/.test(key)) {
    return res.status(400).json({ error: "Unknown photo." });
  }
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.error("R2 delete failed", e);
    return res.status(502).json({ error: `Storage refused the delete (${e.name || "error"}).` });
  }
  res.status(200).json({ deleted: key });
}
