import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

let client: S3Client | null = null;

function getConfig() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!accountId || !bucket || !endpoint || !accessKeyId || !secretAccessKey || !publicBaseUrl) throw new Error("Thiếu cấu hình Cloudflare R2.");
  return { accountId, bucket, endpoint, accessKeyId, secretAccessKey, publicBaseUrl };
}

function getClient(config: ReturnType<typeof getConfig>) {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
  }
  return client;
}

export async function uploadToR2(input: { key: string; body: Buffer; contentType?: string; cacheControl?: string }) {
  const config = getConfig();
  await getClient(config).send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType || "application/octet-stream",
    CacheControl: input.cacheControl || "public, max-age=31536000, immutable",
  }));
  return `${config.publicBaseUrl}/${input.key.split("/").map(encodeURIComponent).join("/")}`;
}
