"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortfolioItem = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function GallerySection({ items }: { items: PortfolioItem[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const current = items[active];

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % items.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + items.length) % items.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, items.length]);

  if (!items.length || !current) return null;

  function prev() {
    setActive((i) => (i - 1 + items.length) % items.length);
  }

  function next() {
    setActive((i) => (i + 1) % items.length);
  }

  return (
    <>
      <section id="gallery" className="border-t border-border bg-bg-elevated py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Portfolio</p>
              <h2 className="display mt-2 text-5xl text-ink sm:text-6xl">Работы</h2>
              <p className="mt-3 max-w-md text-sm text-muted">
                Свежие стрижки и образы мастеров Bazooka — листайте ленту или откройте фото.
              </p>
            </div>
            <a
              href="https://www.instagram.com/bazooka.barbershop"
              target="_blank"
              rel="noreferrer"
              className="pressable inline-flex items-center gap-2 self-start border border-border px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-muted hover:border-gold hover:text-gold"
            >
              <Camera size={15} /> Instagram
            </a>
          </div>

          <div className="relative overflow-hidden border border-border bg-bg">
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="group relative block aspect-[16/10] w-full overflow-hidden sm:aspect-[21/10]"
              aria-label="Открыть фото"
            >
              <Image
                key={current.id}
                src={current.imageUrl}
                alt={current.caption || "Работа Bazooka"}
                fill
                priority
                className="object-cover animate-fade-zoom"
                sizes="(max-width: 1200px) 100vw, 1152px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold">
                    {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </p>
                  <p className="mt-2 max-w-lg text-sm text-ink sm:text-base">
                    {current.caption || "Работа мастеров Bazooka Barbershop"}
                  </p>
                </div>
                <span className="hidden text-xs uppercase tracking-[0.16em] text-muted transition group-hover:text-gold sm:inline">
                  Открыть
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-bg/70 text-ink backdrop-blur hover:border-gold hover:text-gold sm:left-5"
              aria-label="Предыдущее"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-bg/70 text-ink backdrop-blur hover:border-gold hover:text-gold sm:right-5"
              aria-label="Следующее"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((img, i) => {
              const on = i === active;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative h-20 w-28 shrink-0 overflow-hidden border sm:h-24 sm:w-36",
                    on ? "border-gold" : "border-border opacity-55 hover:opacity-100"
                  )}
                  aria-label={`Работа ${i + 1}`}
                  aria-current={on}
                >
                  <Image
                    src={img.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 animate-fade-in sm:p-8"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-border bg-bg/60 text-ink backdrop-blur hover:border-gold hover:text-gold"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-bg/60 text-ink backdrop-blur hover:border-gold hover:text-gold sm:left-6"
            aria-label="Предыдущее"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-border bg-bg/60 text-ink backdrop-blur hover:border-gold hover:text-gold sm:right-6"
            aria-label="Следующее"
          >
            <ChevronRight size={18} />
          </button>

          <div
            className="relative h-[70vh] w-full max-w-5xl animate-fade-zoom"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={`lb-${current.id}`}
              src={current.imageUrl}
              alt={current.caption || "Работа Bazooka"}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
