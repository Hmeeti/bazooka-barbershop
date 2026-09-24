"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatDuration, formatPrice, cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
};

type Barber = {
  id: string;
  name: string;
  specialization: string;
  photoUrl: string;
};

type Slot = { barberId: string; startAt: string; endAt: string };

type User = { id: string; name: string; email: string; phone: string };

const steps = ["Услуга", "Мастер", "Время", "Вход", "Подтверждение"];

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetBarber = searchParams.get("barber");

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [barberId, setBarberId] = useState<string | "any">(presetBarber || "any");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | "otp">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  const totals = useMemo(() => {
    const list = services.filter((s) => selectedServices.includes(s.id));
    return {
      list,
      price: list.reduce((a, s) => a + s.price, 0),
      duration: list.reduce((a, s) => a + s.durationMin, 0),
    };
  }, [services, selectedServices]);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services || []);
        setBarbers(d.barbers || []);
      });
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user));
  }, []);

  useEffect(() => {
    if (!totals.duration) return;
    const q = new URLSearchParams({
      date,
      duration: String(totals.duration),
      barberId: barberId === "any" ? "any" : barberId,
    });
    fetch(`/api/slots?${q}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || []);
        setSelectedSlot(null);
      });
  }, [date, totals.duration, barberId]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function submitAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (authMode === "otp") {
        if (!authForm.code) {
          const res = await fetch("/api/auth/otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "request", email: authForm.email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Ошибка");
          setError("");
          alert("Код отправлен на email (в dev — смотрите консоль сервера)");
          setLoading(false);
          return;
        }
        const res = await fetch("/api/auth/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "verify",
            email: authForm.email,
            code: authForm.code,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка");
        setUser(data.user);
        setStep(4);
      } else if (authMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка");
        setUser(data.user);
        setStep(4);
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(authForm),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка");
        setUser(data.user);
        setStep(4);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking() {
    if (!selectedSlot || !user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceIds: selectedServices,
          barberId: barberId === "any" ? null : barberId,
          startAt: selectedSlot.startAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось записаться");
      setDoneId(data.appointment.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    setError("");
    if (step === 0 && !selectedServices.length) {
      setError("Выберите хотя бы одну услугу");
      return;
    }
    if (step === 2 && !selectedSlot) {
      setError("Выберите время");
      return;
    }
    if (step === 3 && user) {
      setStep(4);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  if (doneId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-gold text-gold">
          <Check />
        </div>
        <h1 className="display text-5xl text-ink">Готово</h1>
        <p className="mt-4 text-muted">
          Запись подтверждена. Письмо с деталями отправлено на email
          {user ? ` (${user.email})` : ""}. В режиме разработки письмо печатается в консоли сервера.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`/api/appointments/${doneId}/ics`}
            className="border border-gold px-5 py-3 text-sm uppercase tracking-[0.14em] text-gold"
          >
            Apple Calendar
          </a>
          <button
            onClick={() => router.push("/cabinet")}
            className="bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg"
          >
            В кабинет
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Онлайн-запись</p>
      <h1 className="display mt-2 text-5xl text-ink sm:text-6xl">Bazooka</h1>

      <ol className="mt-8 flex flex-wrap gap-2">
        {steps.map((label, i) => (
          <li
            key={label}
            className={cn(
              "border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]",
              i === step
                ? "border-gold bg-gold/10 text-gold"
                : i < step
                  ? "border-border-strong text-ink"
                  : "border-border text-muted"
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="mt-10 border border-border bg-surface p-5 sm:p-8">
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Выберите услуги</h2>
            {services.map((s) => {
              const on = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={cn(
                    "flex w-full items-start justify-between gap-4 border p-4 text-left transition",
                    on ? "border-gold bg-gold/5" : "border-border hover:border-border-strong"
                  )}
                >
                  <div>
                    <div className="font-medium text-ink">{s.name}</div>
                    <div className="mt-1 text-sm text-muted">{s.description}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
                      {formatDuration(s.durationMin)}
                    </div>
                  </div>
                  <div className="shrink-0 text-gold">{formatPrice(s.price)}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Выберите мастера</h2>
            <button
              type="button"
              onClick={() => setBarberId("any")}
              className={cn(
                "w-full border p-4 text-left",
                barberId === "any" ? "border-gold bg-gold/5" : "border-border"
              )}
            >
              <div className="font-medium">Любой свободный мастер</div>
              <div className="mt-1 text-sm text-muted">Подберём первого доступного</div>
            </button>
            {barbers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBarberId(b.id)}
                className={cn(
                  "flex w-full items-center gap-4 border p-4 text-left",
                  barberId === b.id ? "border-gold bg-gold/5" : "border-border"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.photoUrl} alt="" className="h-14 w-14 object-cover" />
                <div>
                  <div className="font-medium">{b.name}</div>
                  <div className="text-sm text-muted">{b.specialization}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-medium">Дата и время</h2>
            <p className="mt-1 text-sm text-muted">
              Длительность: {formatDuration(totals.duration)} · {formatPrice(totals.price)}
            </p>
            <input
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
              className="mt-4 w-full border border-border bg-bg px-3 py-2 text-ink outline-none focus:border-gold"
            />
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.length === 0 && (
                <p className="col-span-full text-sm text-muted">Нет свободных слотов на эту дату</p>
              )}
              {slots.map((slot) => {
                const on = selectedSlot?.startAt === slot.startAt;
                return (
                  <button
                    key={slot.startAt + slot.barberId}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "border py-2.5 text-sm",
                      on ? "border-gold bg-gold text-bg" : "border-border text-ink hover:border-gold"
                    )}
                  >
                    {format(new Date(slot.startAt), "HH:mm")}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-medium">
              {user ? `Вы вошли как ${user.name}` : "Авторизация"}
            </h2>
            {user ? (
              <p className="mt-3 text-sm text-muted">
                Можно переходить к подтверждению записи.
              </p>
            ) : (
              <>
                <div className="mt-4 flex gap-2 text-xs uppercase tracking-[0.14em]">
                  {(
                    [
                      ["login", "Вход"],
                      ["register", "Регистрация"],
                      ["otp", "OTP"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAuthMode(mode)}
                      className={cn(
                        "border px-3 py-1.5",
                        authMode === mode ? "border-gold text-gold" : "border-border text-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={submitAuth} className="mt-4 space-y-3">
                  {authMode === "register" && (
                    <>
                      <input
                        required
                        placeholder="Имя"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                        className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
                      />
                      <input
                        required
                        placeholder="Телефон +7..."
                        value={authForm.phone}
                        onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })}
                        className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
                      />
                    </>
                  )}
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
                  />
                  {authMode !== "otp" && (
                    <input
                      required
                      type="password"
                      placeholder="Пароль"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
                    />
                  )}
                  {authMode === "otp" && (
                    <input
                      placeholder="Код из письма (оставьте пустым, чтобы запросить)"
                      value={authForm.code}
                      onChange={(e) => setAuthForm({ ...authForm, code: e.target.value })}
                      className="w-full border border-border bg-bg px-3 py-2 outline-none focus:border-gold"
                    />
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg disabled:opacity-60"
                  >
                    {authMode === "otp" && !authForm.code
                      ? "Получить код"
                      : authMode === "register"
                        ? "Зарегистрироваться"
                        : "Войти"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}

        {step === 4 && selectedSlot && (
          <div>
            <h2 className="text-lg font-medium">Подтверждение</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-muted">Услуги</dt>
                <dd className="text-right">{totals.list.map((s) => s.name).join(", ")}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-muted">Мастер</dt>
                <dd>
                  {barberId === "any"
                    ? "Любой свободный"
                    : barbers.find((b) => b.id === barberId)?.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-muted">Когда</dt>
                <dd className="text-gold">
                  {format(new Date(selectedSlot.startAt), "d MMMM yyyy, HH:mm", {
                    locale: ru,
                  })}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Итого</dt>
                <dd className="text-lg text-gold">{formatPrice(totals.price)}</dd>
              </div>
            </dl>
            <button
              type="button"
              disabled={loading || !user}
              onClick={confirmBooking}
              className="mt-6 w-full bg-gold py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg disabled:opacity-60"
            >
              {loading ? "Создаём запись..." : "Подтвердить запись"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1 text-sm uppercase tracking-[0.14em] text-muted disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Назад
        </button>
        {step < 4 && (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 border border-gold px-4 py-2 text-sm uppercase tracking-[0.14em] text-gold"
          >
            Далее <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
