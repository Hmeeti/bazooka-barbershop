"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type User = { id: string; name: string; email: string } | null;

const links = [
  { href: "/#services", label: "Услуги" },
  { href: "/#barbers", label: "Мастера" },
  { href: "/#gallery", label: "Работы" },
  { href: "/#contacts", label: "Контакты" },
];

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user))
      .catch(() => null);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="display text-2xl tracking-[0.18em] text-gold">
          BAZOOKA
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm uppercase tracking-[0.16em] text-muted transition hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/cabinet"
                className="text-sm uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                {user.name.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                className="text-sm uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                Выйти
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              Войти
            </Link>
          )}
          <Link
            href="/booking"
            className="pressable border border-gold bg-gold px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] text-bg hover:bg-gold-soft"
          >
            Записаться
          </Link>
        </div>

        <button
          className="md:hidden text-ink"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-bg md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col gap-4 px-4 py-5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm uppercase tracking-[0.16em] text-muted"
            >
              {l.label}
            </a>
          ))}
          <Link href="/booking" onClick={() => setOpen(false)} className="text-gold">
            Записаться онлайн
          </Link>
          {user ? (
            <Link href="/cabinet" onClick={() => setOpen(false)}>
              Личный кабинет
            </Link>
          ) : (
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
