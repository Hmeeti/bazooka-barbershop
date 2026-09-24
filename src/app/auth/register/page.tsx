"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/cabinet");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Аккаунт</p>
      <h1 className="display mt-2 text-5xl">Регистрация</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-3 border border-border bg-surface p-6">
        {(
          [
            ["name", "Имя", "text"],
            ["phone", "Телефон", "tel"],
            ["email", "Email", "email"],
            ["password", "Пароль", "password"],
          ] as const
        ).map(([key, placeholder, type]) => (
          <input
            key={key}
            required
            type={type}
            placeholder={placeholder}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
          />
        ))}
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-gold py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg"
        >
          Создать аккаунт
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/auth/login" className="text-gold">
          Войти
        </Link>
      </p>
    </div>
  );
}
