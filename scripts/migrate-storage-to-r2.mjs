import 'dotenv/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'node:fs/promises';

const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sourceBucket = process.env.SUPABASE_STORAGE_BUCKET || 'admin-media';
const targetBucket = process.env.R2_BUCKET_NAME;
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

async function listObjects() {
  const all = [];
  let offset = 0;
  for (;;) {
    const response = await fetch(`${base}/storage/v1/object/list/${sourceBucket}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!response.ok) throw new Error(`list failed ${response.status}: ${await response.text()}`);
    const rows = await response.json();
    all.push(...rows.filter((row) => row.name));
    if (rows.length < 1000) return all;
    offset += rows.length;
  }
}

const objects = await listObjects();
const map = [];
let completed = 0;
async function copy(row) {
  const key = `uploads/${row.name}`;
  const response = await fetch(`${base}/storage/v1/object/${sourceBucket}/${row.name}`, { headers });
  if (!response.ok) throw new Error(`download failed ${row.name}: ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  await s3.send(new PutObjectCommand({
    Bucket: targetBucket,
    Key: key,
    Body: body,
    ContentType: row.metadata?.mimetype || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
  map.push({ oldPath: row.name, newPath: key, size: body.length, mimeType: row.metadata?.mimetype || null });
  completed += 1;
  if (completed % 10 === 0 || completed === objects.length) console.log(`copied ${completed}/${objects.length}`);
}

for (let i = 0; i < objects.length; i += 5) await Promise.all(objects.slice(i, i + 5).map(copy));
await fs.writeFile('/private/tmp/r2-storage-map.json', JSON.stringify(map.sort((a, b) => a.oldPath.localeCompare(b.oldPath)), null, 2));
console.log(`done: ${completed} objects; map: /private/tmp/r2-storage-map.json`);
