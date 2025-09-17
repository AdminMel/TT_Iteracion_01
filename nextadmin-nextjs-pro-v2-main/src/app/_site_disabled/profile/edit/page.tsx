"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadImage } from "@/lib/upload";
import { router } from "next/client";
import toast from "react-hot-toast";

// Helpers locales para preview
const makePreview = (f?: File | null) => (f ? URL.createObjectURL(f) : null);

// Tipos (ligeros) para UI
type LinkType =
  | "WEBSITE" | "EMAIL" | "GITHUB" | "GITLAB" | "LINKEDIN" | "X" | "FACEBOOK"
  | "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "TWITCH" | "DISCORD" | "WHATSAPP"
  | "TELEGRAM" | "OTHER";

type LinkInput = {
  id?: string;
  type: LinkType;
  url: string;
  username?: string;
  label?: string;
  isPublic: boolean;
  order: number;
};

export default function EditProfilePage() {
  // refs de inputs (no necesitas “f” suelta)
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // previews locales (blob:) para UX
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // estado de formulario
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [links, setLinks] = useState<LinkInput[]>([]);

  // UI helpers
  const [interestDraft, setInterestDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [coverBusy, setCoverBusy] = useState(false);

  // ------- cargar perfil al montar (para hidratar bio/intereses/enlaces) -------
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const p = await res.json();
        if (cancel) return;

        setBio(p?.bio ?? "");
        setInterests(Array.isArray(p?.interests) ? p.interests : []);
        const normLinks: LinkInput[] = (p?.links ?? [])
          .map((l: any, i: number) => ({
            id: l.id,
            type: (l.type ?? "WEBSITE") as LinkType,
            url: l.url ?? "",
            username: l.username ?? "",
            label: l.label ?? "",
            isPublic: l.isPublic ?? true,
            order: Number.isFinite(l.order) ? l.order : i,
          }))
        setLinks(normLinks);
      } catch {
        // si falla, dejamos valores por defecto
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // ------- handlers de uploads (lógica TAL CUAL) -------
  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1) preview local
    setAvatarPreview(makePreview(file));
    setAvatarBusy(true);

    try {
      // 2) subir al servidor → URL pública
      const { url } = await uploadImage(file, "avatar");

      // 3) guardar en tu perfil
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: url }),
      });
    } catch (err: any) {
      console.error("Upload avatar failed:", err);
      alert("Error al subir avatar: " + (err?.message || "desconocido"));
      // opcional: podrías revertir el preview si quieres
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(makePreview(file));
    setCoverBusy(true);

    try {
      const { url } = await uploadImage(file, "cover");
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverUrl: url }),
      });
    } catch (err: any) {
      console.error("Upload cover failed:", err);
      alert("Error al subir portada: " + (err?.message || "desconocido"));
    } finally {
      setCoverBusy(false);
    }
  }

  // ------- intereses -------
  const addInterest = () => {
    const t = interestDraft.trim();
    if (!t) return;
    if (!interests.some((i) => i.toLowerCase() === t.toLowerCase())) {
      setInterests((prev) => [...prev, t]);
    }
    setInterestDraft("");
  };
  const removeInterest = (i: number) =>
    setInterests((prev) => prev.filter((_, idx) => idx !== i));

  // ------- enlaces -------
  const addLink = () =>
    setLinks((prev) => [
      ...prev,
      { type: "WEBSITE", url: "", username: "", label: "", isPublic: true, order: prev.length },
    ]);
  const updLink = (i: number, patch: Partial<LinkInput>) =>
    setLinks((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  const rmLink = (i: number) =>
    setLinks((prev) => prev.filter((_, idx) => idx !== i).map((l, idx) => ({ ...l, order: idx })));

  // ------- guardar (bio + intereses + enlaces) -------
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        bio,
        interests,
        links,
      };

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.message || "Error al actualizar");

      toast.success("Perfil actualizado");
    } catch (err: any) {
      console.error("update failed:", err);
      toast.error("Falló al actualizar: " + (err?.message || "desconocido"));
    } finally {
      setSaving(false);
    }
  }

  // ------- UI helpers bonitos -------
  const skeleton = useMemo(
    () => (
      <div className="animate-pulse space-y-8">
        <div className="h-36 w-full rounded bg-gray-200/70" />
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-gray-200/70" />
          <div className="h-8 w-48 rounded bg-gray-200/70" />
        </div>
        <div className="h-24 w-full rounded bg-gray-200/70" />
        <div className="h-36 w-full rounded bg-gray-200/70" />
      </div>
    ),
    []
  );

  // ————————— UI —————————
  return (
    <div className="mx-auto w-full max-w-[970px]">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-semibold">Editar perfil</h1>
        <Link href="/profile" className="rounded-md bg-gray-800 px-3 py-2 text-white">
          Volver
        </Link>
      </div>

      <div className="rounded-[10px] bg-white p-5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        {loading ? (
          skeleton
        ) : (
          <div className="space-y-8">
            {/* COVER */}
            <section className="space-y-3">
              <h2 className="font-medium">Portada</h2>
              <div className="flex flex-col gap-3">
                <div className="relative h-36 w-full overflow-hidden rounded">
                  {coverPreview ? (
                    <img src={coverPreview} alt="preview portada" className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src="/images/cover/cover-01.png"
                      alt="actual portada"
                      width={970}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {coverBusy && (
                    <div className="absolute inset-0 grid place-items-center bg-black/20 text-white text-sm">
                      Subiendo…
                    </div>
                  )}
                </div>

                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickCover}
                  className="block w-full max-w-xs text-sm"
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: JPG, PNG, WebP, GIF. Máximo 10MB.
                </p>
              </div>
            </section>

            {/* AVATAR */}
            <section className="space-y-3">
              <h2 className="font-medium">Avatar</h2>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/70 shadow">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Image
                      src="/images/logo/logo.svg"
                      width={96}
                      height={96}
                      alt="actual avatar"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {avatarBusy && (
                    <div className="absolute inset-0 grid place-items-center rounded-full bg-black/20 text-xs text-white">
                      Subiendo…
                    </div>
                  )}
                </div>

                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickAvatar}
                  className="block w-full max-w-xs text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                Formatos permitidos: JPG, PNG, WebP, GIF. Máximo 10MB.
              </p>
            </section>

            {/* BIO + SUBMIT */}
            <section>
              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium">Biografía</label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="mt-1 w-full rounded border p-2"
                    placeholder="Escribe algo sobre ti…"
                  />
                </div>

                {/* INTERESES */}
                <div>
                  <h3 className="mb-2 font-medium">Intereses</h3>
                  {interests.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interests.map((t, i) => (
                        <span
                          key={`${t}-${i}`}
                          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
                        >
                          {t}
                          <button
                            type="button"
                            className="text-red-500"
                            onClick={() => removeInterest(i)}
                            aria-label="Quitar interés"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aún no agregas intereses.</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <input
                      className="w-full rounded-md border px-3 py-2"
                      placeholder="Añadir interés (p. ej., Fútbol, Videojuegos)"
                      value={interestDraft}
                      onChange={(e) => setInterestDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" ? (e.preventDefault(), addInterest()) : undefined}
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="rounded-md bg-primary px-4 py-2 text-white"
                    >
                      Añadir
                    </button>
                  </div>
                </div>

                {/* ENLACES */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">Enlaces</h3>
                    <button
                      type="button"
                      onClick={addLink}
                      className="rounded-md bg-primary px-3 py-1.5 text-white"
                    >
                      + Añadir enlace
                    </button>
                  </div>

                  {links.length ? (
                    <div className="space-y-3">
                      {links.map((l, i) => (
                        <div key={l.id ?? i} className="grid grid-cols-12 items-center gap-2 rounded-md border p-3">
                          <select
                            className="col-span-12 md:col-span-2 rounded-md border px-2 py-2"
                            value={l.type}
                            onChange={(e) =>
                              updLink(i, { type: e.target.value as LinkType })
                            }
                          >
                            {[
                              "WEBSITE","EMAIL","GITHUB","GITLAB","LINKEDIN","X","FACEBOOK",
                              "INSTAGRAM","TIKTOK","YOUTUBE","TWITCH","DISCORD","WHATSAPP",
                              "TELEGRAM","OTHER",
                            ].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>

                          <input
                            className="col-span-12 md:col-span-4 rounded-md border px-3 py-2"
                            placeholder="URL"
                            value={l.url}
                            onChange={(e) => updLink(i, { url: e.target.value })}
                          />

                          <input
                            className="col-span-12 md:col-span-2 rounded-md border px-3 py-2"
                            placeholder="Usuario/handle"
                            value={l.username ?? ""}
                            onChange={(e) => updLink(i, { username: e.target.value })}
                          />

                          <input
                            className="col-span-12 md:col-span-2 rounded-md border px-3 py-2"
                            placeholder="Etiqueta"
                            value={l.label ?? ""}
                            onChange={(e) => updLink(i, { label: e.target.value })}
                          />

                          <label className="col-span-6 md:col-span-1 flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={l.isPublic}
                              onChange={(e) => updLink(i, { isPublic: e.target.checked })}
                            />
                            Público
                          </label>

                          <div className="col-span-6 md:col-span-1 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => rmLink(i)}
                              className="rounded border px-2 py-1 text-red-600"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Aún no agregas enlaces.</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/profile" className="rounded-md border px-5 py-2">
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-primary px-5 py-2 text-white disabled:opacity-60"
                  >
                    {saving ? "Guardando…" : "Guardar todo"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
