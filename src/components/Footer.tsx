import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <div className="display text-3xl tracking-[0.18em] text-gold">BAZOOKA</div>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Барбершоп в Таразе. Стрижки, борода, уход — запись онлайн за минуту.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted">
          <a
            href="https://www.instagram.com/bazooka.barbershop"
            target="_blank"
            rel="noreferrer"
            className="hover:text-gold"
          >
            Instagram @bazooka.barbershop
          </a>
          <a href="tel:+77081991080" className="hover:text-gold">
            +7 708 199 10 80
          </a>
          <Link href="/booking" className="hover:text-gold">
            Онлайн-запись
          </Link>
        </div>
      </div>
    </footer>
  );
}
