// src/components/Auth/SigninWithPassword.tsx
"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../ui-elements/checkbox";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    username: process.env.NEXT_PUBLIC_DEMO_USERNAME || "",
    password: process.env.NEXT_PUBLIC_DEMO_PASSWORD || "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("platform_username");
    if (saved) setData(d => ({ ...d, username: saved, remember: true }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data.username) return toast.error("Ingresa tu usuario/boleta.");
    if (!data.password) return toast.error("Ingresa tu contraseña.");

    setLoading(true);
    const res = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
      callbackUrl: "/",
    });

    if (res?.error) {
      toast.error(res.error === "CredentialsSignin" ? "Usuario o contraseña inválidos" : res.error);
      setLoading(false);
      return;
    }

    if (data.remember) localStorage.setItem("platform_username", data.username);
    else localStorage.removeItem("platform_username");

    toast.success("Inicio de sesión correcto");
    setLoading(false);
    router.push(res?.url ?? "/");
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="text"
        label="Usuario / Boleta"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Ingresa tu usuario o boleta"
        name="username"
        handleChange={handleChange}
        value={data.username}
        icon={<EmailIcon />}
      />
      <InputGroup
        type="password"
        label="Contraseña"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Ingresa tu contraseña"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />
      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
        >
          Iniciar sesión
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
