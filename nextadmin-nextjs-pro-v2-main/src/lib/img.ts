// src/lib/img.ts
export const isBlobLike = (s: string) =>
  typeof s === "string" && (s.startsWith("blob:") || s.startsWith("data:"));

/** Normaliza una key/ruta local a algo válido para <Image>:
 *  - "uploads/abc.webp" -> "/uploads/abc.webp"
 *  - "/uploads/abc.webp" -> "/uploads/abc.webp"
 *  - "http(s)://", "blob:", "data:" -> se devuelve tal cual
 *  - vacío -> ""
 */
export function localSrc(raw?: string | null): string {
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || isBlobLike(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}
