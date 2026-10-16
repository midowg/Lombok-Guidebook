// Shared Cloudflare R2 client (S3-compatible). Files starting with "_" are not routes on Vercel.
import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET = process.env.R2_BUCKET;
export const PREFIX = "album/";

export const r2 = new S3Client({
  region: "auto",
  forcePathStyle: true,
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


export function missingConfig() {
  return ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]
    .filter((k) => !process.env[k]);
}
