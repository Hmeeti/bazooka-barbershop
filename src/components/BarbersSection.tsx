"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type BarberCardData = {
  id: string;
  name: string;
  specialization: string;
  bio: string | null;
  details: string | null;
  experienceYears: number;
  skills: string;
  photoUrl: string;
  workStart: number;
  workEnd: number;
};

function parseSkills(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function BarbersSection({ barbers }: { barbers: BarberCardData[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = barbers.find((b) => b.id === openId) || null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <>
      <section id="barbers" className="border-t border-border bg-bg py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Команда</p>
          <h2 className="display mt-2 text-5xl text-ink sm:text-6xl">Мастера</h2>
          <p className="mt-3 max-w-lg text-sm text-muted">
            Портреты мастеров Bazooka. Откройте карточку — там опыт, специализация и запись.
          </p>

          <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
            {barbers.map((b) => (
              <article key={b.id} className="flex h-full flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-white">
                  <Image
                    src={b.photoUrl}
                    alt={b.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col sm:mt-5">
                  <h3 className="display text-2xl tracking-[0.06em] text-ink sm:text-3xl">
                    {b.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 min-h-[2.6em] text-[10px] uppercase leading-snug tracking-[0.12em] text-gold sm:min-h-[2.8em] sm:text-xs sm:tracking-[0.16em]">
                    {b.specialization}
                  </p>
                  <p className="mt-2 text-xs text-muted sm:text-sm">
                    Опыт {b.experienceYears}{" "}
                    {b.experienceYears === 1
                      ? "год"
                      : b.experienceYears < 5
                        ? "года"
                        : "лет"}
                  </p>

                  <button
                    type="button"
                    onClick={() => setOpenId(b.id)}
                    className="mt-auto w-full border border-border-strong px-2 py-2.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink hover:border-gold hover:text-gold sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.18em]"
                  >
                    Подробнее
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`barber-title-${active.id}`}
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-border bg-bg-elevated sm:max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border border-border bg-bg/80 text-ink backdrop-blur hover:border-gold hover:text-gold"
              aria-label="Закрыть"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[320px] bg-white md:min-h-full">
                <Image
                  src={active.photoUrl}
                  alt={active.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.28em] text-gold">Барбер</p>
                <h3
                  id={`barber-title-${active.id}`}
                  className="display mt-2 text-5xl tracking-[0.06em] text-ink"
                >
                  {active.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{active.specialization}</p>

                <div className="mt-6 grid grid-cols-2 gap-3 border-y border-border py-4 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Опыт</p>
                    <p className="mt-1 text-ink">
                      {active.experienceYears}{" "}
                      {active.experienceYears === 1
                        ? "год"
                        : active.experienceYears < 5
                          ? "года"
                          : "лет"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">График</p>
                    <p className="mt-1 text-ink">
                      {String(active.workStart).padStart(2, "0")}:00–
                      {String(active.workEnd).padStart(2, "0")}:00
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted">
                  {active.details || active.bio}
                </p>

                {parseSkills(active.skills).length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Специализация</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {parseSkills(active.skills).map((skill) => (
                        <li
                          key={skill}
                          className="border border-border px-3 py-1.5 text-xs tracking-[0.04em] text-ink"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={`/booking?barber=${active.id}`}
                    className="pressable bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-bg hover:bg-gold-soft"
                  >
                    Записаться к мастеру
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="border border-border px-5 py-3 text-xs uppercase tracking-[0.16em] text-muted hover:border-border-strong hover:text-ink"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
