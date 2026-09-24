import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatPrice } from "@/lib/utils";
import { MapPin, Phone, Clock } from "lucide-react";
import { BarbersSection } from "@/components/BarbersSection";
import { GallerySection } from "@/components/GallerySection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, barbers, portfolio, branches] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.barber.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.portfolioImage.findMany({ orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.branch.findMany({ orderBy: [{ isPrimary: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <div>
      {/* HERO — brand first, full-bleed */}
      <section className="relative min-h-[100svh] overflow-hidden grain">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80"
            alt="Bazooka Barbershop"
            fill
            priority
            className="object-cover animate-pan"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <p className="animate-rise text-xs uppercase tracking-[0.35em] text-gold">
            Тараз · @bazooka.barbershop
          </p>
          <h1 className="display animate-rise mt-4 max-w-3xl text-[clamp(4.5rem,16vw,9.5rem)] text-ink [animation-delay:80ms]">
            BAZOOKA
          </h1>
          <p className="animate-rise mt-4 max-w-md text-base text-muted sm:text-lg [animation-delay:160ms]">
            Мужские стрижки, борода и уход. Запишитесь онлайн — выберите мастера и удобный слот.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
            <Link
              href="/booking"
              className="pressable border border-gold bg-gold px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-bg hover:bg-gold-soft"
            >
              Записаться онлайн
            </Link>
            <a
              href="#services"
              className="pressable border border-border-strong px-7 py-3.5 text-sm uppercase tracking-[0.16em] text-ink hover:border-gold hover:text-gold"
            >
              Смотреть услуги
            </a>
            </div>
          <div className="h-16 sm:h-20" />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-t border-border bg-bg py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Каталог</p>
              <h2 className="display mt-2 text-5xl text-ink sm:text-6xl">Услуги</h2>
            </div>
            <p className="max-w-sm text-sm text-muted">
              Цены ориентированы на филиалы Bazooka в Таразе. Актуальный прайс уточняйте при записи.
            </p>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.id}
                className="group relative overflow-hidden bg-surface p-6 transition hover:bg-surface-2"
              >
                <div className="relative mb-5 aspect-[16/10] overflow-hidden">
                  {s.imageUrl && (
                    <Image
                      src={s.imageUrl}
                      alt={s.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium text-ink">{s.name}</h3>
                  <span className="shrink-0 text-gold">{formatPrice(s.price)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">
                  {formatDuration(s.durationMin)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/booking"
              className="pressable inline-flex border border-gold px-6 py-3 text-sm uppercase tracking-[0.16em] text-gold hover:bg-gold hover:text-bg"
            >
              Выбрать услугу и записаться
            </Link>
          </div>
        </div>
      </section>

      <BarbersSection barbers={barbers} />

      <GallerySection items={portfolio} />

      {/* CONTACTS */}
      <section id="contacts" className="border-t border-border bg-bg-elevated py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Контакты</p>
          <h2 className="display mt-2 text-5xl text-ink sm:text-6xl">Где мы</h2>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="border border-border bg-surface p-5 transition hover:border-border-strong"
                >
                  <h3 className="font-medium text-ink">{branch.name}</h3>
                  <div className="mt-3 space-y-2 text-sm text-muted">
                    <p className="flex items-start gap-2">
                      <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
                      {branch.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={16} className="shrink-0 text-gold" />
                      {branch.hours}
                    </p>
                    <a href={`tel:${branch.phone}`} className="flex items-center gap-2 hover:text-gold">
                      <Phone size={16} className="shrink-0 text-gold" />
                      +7 708 199 10 80
                    </a>
                  </div>
                  {branch.mapUrl && (
                    <a
                      href={branch.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-xs uppercase tracking-[0.16em] text-gold"
                    >
                      Открыть на 2ГИС →
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="relative min-h-[360px] overflow-hidden border border-border bg-surface">
              <iframe
                title="Bazooka на карте"
                src="https://www.openstreetmap.org/export/embed.html?bbox=71.355%2C42.885%2C71.395%2C42.910&layer=mapnik&marker=42.897%2C71.375"
                className="absolute inset-0 h-full w-full grayscale contrast-125 invert-[0.88]"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
