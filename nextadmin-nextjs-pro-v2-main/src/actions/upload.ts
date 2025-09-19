"use server";

import { isAuthorized } from "@/libs/isAuthorized";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type SignedUrlResponse =
  | { success: { url: string; key: string }; failure?: never }
  | { success?: never; failure: string };

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const maxSize = 2 * 1024 * 1024; // 2 MB

const {
  STORAGE_DRIVER = "local",
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env;

function extFrom(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("png")) return "png";
  if (t.includes("jpeg") || t.includes("jpg")) return "jpg";
  if (t.includes("webp")) return "webp";
  return "bin";
}

function r2() {
  if (!R2_ACCOUNT_ID) throw new Error("R2_ACCOUNT_ID no configurado");
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)
    throw new Error("Credenciales R2 no configuradas");
  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function getSignedURL(
  type: string,
  size: number,
  kind: "avatar" | "cover" = "avatar"
): Promise<SignedUrlResponse> {
  try {
    const user = await isAuthorized();
    if (!user) return { failure: "not authenticated" };
    if (!acceptedTypes.includes(type)) return { failure: "invalid file type" };
    if (!size || size > maxSize) return { failure: "file too large" };

    const keyBase = `${kind === "avatar" ? "avatars" : "covers"}/${user.id}/${Date.now()}.${extFrom(type)}`;

    if (STORAGE_DRIVER === "r2") {
      if (!R2_BUCKET_NAME) return { failure: "R2_BUCKET_NAME no configurado" };
      const cmd = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: keyBase,
        ContentType: type,
        Metadata: { userId: String(user.id) },
      });
      const url = await getSignedUrl(r2(), cmd, { expiresIn: 60 });
      return { success: { url, key: keyBase } };
    }

    // LOCAL: usamos API propia /api/upload y guardamos en /public/<key>
    const key = `uploads/${keyBase.split("/").slice(-1)[0]}`; // p.ej. uploads/169...jpg
    const url = `/api/upload?key=${encodeURIComponent(key)}`;
    return { success: { url, key } };
  } catch (e: any) {
    console.error("[getSignedURL] error:", e);
    return { failure: e?.message ?? "no se pudo generar URL de subida" };
  }
}
