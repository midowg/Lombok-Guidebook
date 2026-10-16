// GET -> { photos: [{ key, url, at }] }, newest first. URLs are signed for 6 hours.
import { ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, BUCKET, PREFIX, missingConfig } from "./_r2.js";

export default async function handler(req, res) {
  const missing = missingConfig();
  if (missing.length) return res.status(500).json({ error: `Server is missing: ${missing.join(", ")}` });

  const items = [];
  let token;
  do {
    const out = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PREFIX, ContinuationToken: token }));
    items.push(...(out.Contents || []));
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token && items.length < 1000);

  items.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  const photos = await Promise.all(items.slice(0, 300).map(async (o) => {
    return {
      key: o.Key,
      at: o.LastModified,
      url: await getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: o.Key }), { expiresIn: 21600 }),
    };
  }));
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ photos });
}
