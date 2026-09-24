"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "password") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push("/cabinet");
        router.refresh();
      } else if (!code) {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "request", email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setInfo("Код отправлен. В dev смотрите консоль сервера.");
      } else {
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", email, code }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        router.push("/cabinet");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Аккаунт</p>
      <h1 className="display mt-2 text-5xl">Вход</h1>
      <div className="mt-6 flex gap-2 text-xs uppercase tracking-[0.14em]">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`border px-3 py-1.5 ${mode === "password" ? "border-gold text-gold" : "border-border text-muted"}`}
        >
          Email / пароль
        </button>
        <button
          type="button"
          onClick={() => setMode("otp")}
          className={`border px-3 py-1.5 ${mode === "otp" ? "border-gold text-gold" : "border-border text-muted"}`}
        >
          OTP
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 border border-border bg-surface p-6">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
        />
        {mode === "password" ? (
          <input
            required
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
          />
        ) : (
          <input
            placeholder="Код (пусто = запросить)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
          />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-success">{info}</p>}
        <button
          disabled={loading}
          className="w-full bg-gold py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg"
        >
          {mode === "otp" && !code ? "Получить код" : "Войти"}
        </button>
      </form>
      <p className="mt-4 text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href="/auth/register" className="text-gold">
          Регистрация
        </Link>
      </p>
    </div>
  );
}
