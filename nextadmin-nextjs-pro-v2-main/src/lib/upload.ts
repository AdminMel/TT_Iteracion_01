export async function uploadImage(file: File, kind: "avatar" | "cover" | "generic" = "generic") {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${txt || res.statusText}`);
  }

  const json = await res.json();
  return json as { ok: true; url: string; kind: string; name: string; type: string; size: number };
}
