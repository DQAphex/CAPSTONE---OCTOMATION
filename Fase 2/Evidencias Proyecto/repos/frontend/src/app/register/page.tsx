"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LoaderCircle, Mail, User } from "lucide-react";

import AuthCard from "@/components/auth/AuthCard";
import AuthField from "@/components/auth/AuthField";
import PasswordField from "@/components/auth/PasswordField";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => router.push("/dashboard"), 1000);
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Configura tu workspace y empieza a automatizar en minutos."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 transition-colors hover:text-violet-300"
          >
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="fullName"
          name="fullName"
          type="text"
          label="Nombre Completo"
          icon={User}
          placeholder="Juan Pérez"
          autoComplete="name"
          required
          disabled={isLoading}
        />
        <AuthField
          id="workspace"
          name="workspace"
          type="text"
          label="Nombre de la Empresa (Workspace)"
          icon={Building2}
          placeholder="Acme Corp"
          autoComplete="organization"
          required
          disabled={isLoading}
        />
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          placeholder="tu@empresa.com"
          autoComplete="email"
          required
          disabled={isLoading}
        />
        <PasswordField
          id="password"
          name="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading && <LoaderCircle className="size-4 animate-spin" />}
          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
