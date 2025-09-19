"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons"; // puedes cambiar EmailIcon por un UserIcon si tienes
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../ui-elements/checkbox";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    username: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "", // boleta/usuario
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Prefill desde localStorage si el usuario marcó "recordarme"
  useEffect(() => {
    const savedUser = localStorage.getItem("platform_username");
    if (savedUser) {
      setData((d) => ({ ...d, username: savedUser, remember: true }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.username) {
      return toast.error("Ingresa tu usuario/boleta.");
    }
    if (!data.password) {
      return toast.error("Ingresa tu contraseña.");
    }

    try {
      setLoading(true);
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (res?.error) {
        toast.error("Usuario o contraseña inválidos");
        setLoading(false);
        return;
      }

      // Guardar/limpiar "recordarme"
      if (data.remember) {
        localStorage.setItem("platform_username", data.username);
      } else {
        localStorage.removeItem("platform_username");
      }

      toast.success("Inicio de sesión correcto");
      setLoading(false);
      setData({ username: "", password: "", remember: false });
      router.push(res?.url ?? "/dashboard");
    } catch (err) {
      setLoading(false);
      toast.error("No se pudo iniciar sesión. Intenta de nuevo.");
    }
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
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-70"
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
