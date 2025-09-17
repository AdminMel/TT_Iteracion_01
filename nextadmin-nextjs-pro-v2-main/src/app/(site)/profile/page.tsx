"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";
import { localSrc, isBlobLike } from "@/lib/img";

type LinkType =
  | "WEBSITE" | "EMAIL" | "GITHUB" | "GITLAB" | "LINKEDIN" | "X" | "FACEBOOK"
  | "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "TWITCH" | "DISCORD" | "WHATSAPP"
  | "TELEGRAM" | "OTHER";

type ViewProfile = {
  id: string;
  name: string;
  email: string;
  boleta: string;
  image: string | null;     // avatarUrl en la BD
  coverUrl: string | null;
  bio: string;
  programa: string;
  interests: string[];
  links: Array<{
    id: string;
    type: LinkType;
    url: string;
    username?: string | null;
    label?: string | null;
    isPublic: boolean;
    order: number;
  }>;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [p, setP] = useState<ViewProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // roles desde la sesión
  const roles = session?.user?.roles ?? [];
  const isAlumno = roles.includes("ALUMNO");

  // texto: preferimos sesión y caemos al perfil
  const name = session?.user?.name ?? p?.name ?? "Usuario";
  const email = session?.user?.email ?? p?.email ?? "";
  // @ts-expect-error
  const boleta = session?.user?.boleta ?? p?.boleta ?? "";
  // @ts-expect-error
  const carrera = session?.user?.carrera ?? p?.programa ?? "";

  // control de errores para fallback de imágenes
  const [avatarErr, setAvatarErr] = useState(false);
  const [coverErr, setCoverErr] = useState(false);

  // AVATAR / COVER: usar SOLO lo que viene del endpoint (no mezclar con session)
  const avatar = useMemo(() => {
    const raw = p?.image ?? "";
    const normalized = localSrc(raw) || "/images/logo/logo.svg";
    return avatarErr ? "/images/logo/logo.svg" : normalized;
  }, [p?.image, avatarErr]);

  const cover = useMemo(() => {
    const raw = p?.coverUrl ?? "";
    const normalized = localSrc(raw) || "/images/cover/cover-01.png";
    return coverErr ? "/images/cover/cover-01.png" : normalized;
  }, [p?.coverUrl, coverErr]);

  const avatarIsBlob = isBlobLike(avatar);
  const coverIsBlob  = isBlobLike(cover);

  // carga del perfil
  useEffect(() => {
    let cancelled = false;
    if (status === "loading") return;

    (async () => {
      try {
        const res = await fetch("/api/user/profile", {
          method: "GET",
          headers: { accept: "application/json" },
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const json = (await res.json()) as ViewProfile;
        if (!cancelled) setP(json);
      } catch (e) {
        console.error("[profile] fetch failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [status]);

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-semibold">Mi perfil</h1>
        <Link href="/profile/edit" className="rounded-md bg-primary px-3 py-2 text-white">
          Editar
        </Link>
      </div>

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* COVER + AVATAR */}
        <div className="relative z-0 h-35 overflow-hidden rounded-t-[10px] md:h-65">
          {coverIsBlob ? (
            <img
              src={cover}
              alt="cover"
              className="h-full w-full object-cover object-center"
              onError={() => setCoverErr(true)}
            />
          ) : (
            <Image
              src={cover}
              alt="cover"
              className="h-full w-full object-cover object-center"
              width={970}
              height={260}
              onError={() => setCoverErr(true)}
              // unoptimized // (opcional) útil en dev
            />
          )}

          <div className="absolute inset-0 z-10 grid place-items-center">
            <div className="h-30 w-30 overflow-hidden rounded-full ring-4 ring-white/70 shadow-lg sm:h-44 sm:w-44 dark:ring-gray-900/70">
              {avatarIsBlob ? (
                <img
                  src={avatar}
                  alt="avatar"
                  className="h-full w-full object-cover"
                  onError={() => setAvatarErr(true)}
                />
              ) : (
                <Image
                  src={avatar}
                  width={176}
                  height={176}
                  className="h-full w-full object-cover"
                  alt="avatar"
                  onError={() => setAvatarErr(true)}
                  // unoptimized
                />
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 text-center">
          <div className="space-y-1">
            <h3 className="text-heading-6 font-bold text-dark dark:text-white flex items-center justify-center gap-2">
              {name}
              {isAlumno && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  ALUMNO
                </span>
              )}
            </h3>

            {email && <p className="text-body-sm">{email}</p>}
            {isAlumno && boleta && <p className="text-body-sm">Boleta: {boleta}</p>}
            {isAlumno && carrera && <p className="text-body-sm">Programa Académico: {carrera}</p>}
          </div>

          {/* Bio */}
          {loading ? (
            <div className="mx-auto mt-6 h-20 max-w-[720px] animate-pulse rounded-md bg-gray-200/60" />
          ) : (p?.bio ?? "").length > 0 ? (
            <div className="mx-auto mt-6 max-w-[720px] text-left">
              <h4 className="font-medium text-dark dark:text-white">Biografía</h4>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed">{p!.bio}</p>
            </div>
          ) : null}

          {/* Intereses */}
          {!loading && (
            <div className="mx-auto mt-6 max-w-[720px] text-left">
              <h4 className="font-medium text-dark dark:text-white">Intereses</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {p?.interests?.length ? (
                  p.interests.map((t, i) => (
                    <span key={`${t}-${i}`} className="rounded-full border px-3 py-1 text-sm">
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Sin intereses aún</span>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {!loading && (
            <div className="mx-auto mt-6 max-w-[720px] text-left">
              <h4 className="font-medium text-dark dark:text-white">Enlaces</h4>
              <ul className="mt-3 space-y-2">
                {(p?.links ?? [])
                  .filter((l) => l.isPublic)
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <span className="inline-flex min-w-24 text-xs font-medium uppercase opacity-60">
                        {l.type}
                      </span>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-primary underline"
                      >
                        {l.label || l.username || l.url}
                      </a>
                    </li>
                  ))}
                {!p?.links?.length && <li className="text-sm text-gray-500">Sin enlaces todavía</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
