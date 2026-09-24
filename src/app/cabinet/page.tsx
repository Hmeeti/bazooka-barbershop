"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatPrice, cn } from "@/lib/utils";

type Appointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  totalPrice: number;
  barber: { name: string };
  services: { service: { name: string } }[];
};

type User = { id: string; name: string; email: string; phone: string };

export default function CabinetPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newStart, setNewStart] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const me = await fetch("/api/auth/me");
    if (!me.ok) {
      router.push("/auth/login");
      return;
    }
    const meData = await me.json();
    setUser(meData.user);
    const ap = await fetch("/api/appointments");
    const apData = await ap.json();
    setAppointments(apData.appointments || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up: Appointment[] = [];
    const pa: Appointment[] = [];
    for (const a of appointments) {
      if (
        new Date(a.startAt).getTime() >= now &&
        a.status !== "cancelled" &&
        a.status !== "completed"
      ) {
        up.push(a);
      } else {
        pa.push(a);
      }
    }
    return {
      upcoming: up.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ),
      past: pa,
    };
  }, [appointments]);

  async function cancel(id: string) {
    if (!confirm("Отменить запись?")) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Ошибка");
      return;
    }
    setMessage("Запись отменена");
    load();
  }

  async function reschedule(id: string) {
    if (!newStart) return;
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reschedule",
        startAt: new Date(newStart).toISOString(),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Ошибка");
      return;
    }
    setRescheduleId(null);
    setNewStart("");
    setMessage("Запись перенесена");
    load();
  }

  if (loading) {
    return <div className="p-10 text-muted">Загрузка кабинета...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Личный кабинет</p>
      <h1 className="display mt-2 text-5xl">{user?.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {user?.email} · {user?.phone}
      </p>

      <div className="mt-6">
        <Link
          href="/booking"
          className="inline-flex bg-gold px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-bg"
        >
          Новая запись
        </Link>
      </div>

      {message && <p className="mt-4 text-sm text-gold">{message}</p>}

      <section className="mt-12">
        <h2 className="text-lg font-medium">Предстоящие</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-muted">Нет предстоящих записей</p>
          )}
          {upcoming.map((a) => (
            <AppointmentCard
              key={a.id}
              a={a}
              onCancel={() => cancel(a.id)}
              onReschedule={() => setRescheduleId(a.id)}
              isRescheduling={rescheduleId === a.id}
              newStart={newStart}
              setNewStart={setNewStart}
              confirmReschedule={() => reschedule(a.id)}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">История</h2>
        <div className="mt-4 space-y-3">
          {past.length === 0 && <p className="text-sm text-muted">Пока пусто</p>}
          {past.map((a) => (
            <AppointmentCard key={a.id} a={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AppointmentCard({
  a,
  onCancel,
  onReschedule,
  isRescheduling,
  newStart,
  setNewStart,
  confirmReschedule,
}: {
  a: Appointment;
  onCancel?: () => void;
  onReschedule?: () => void;
  isRescheduling?: boolean;
  newStart?: string;
  setNewStart?: (v: string) => void;
  confirmReschedule?: () => void;
}) {
  const statusLabel: Record<string, string> = {
    confirmed: "Подтверждена",
    cancelled: "Отменена",
    completed: "Завершена",
    rescheduled: "Перенесена",
  };

  return (
    <article className="border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold">
            {format(new Date(a.startAt), "d MMMM yyyy, HH:mm", { locale: ru })}
          </p>
          <p className="mt-1 font-medium">
            {a.services.map((s) => s.service.name).join(", ")}
          </p>
          <p className="mt-1 text-sm text-muted">Мастер: {a.barber.name}</p>
        </div>
        <div className="text-right">
          <span
            className={cn(
              "text-xs uppercase tracking-[0.14em]",
              a.status === "cancelled" ? "text-danger" : "text-muted"
            )}
          >
            {statusLabel[a.status] || a.status}
          </span>
          <p className="mt-2 text-sm">{formatPrice(a.totalPrice)}</p>
        </div>
      </div>

      {onCancel && onReschedule && a.status !== "cancelled" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onReschedule}
            className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted hover:border-gold hover:text-gold"
          >
            Перенести
          </button>
          <button
            onClick={onCancel}
            className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted hover:border-danger hover:text-danger"
          >
            Отменить
          </button>
          <a
            href={`/api/appointments/${a.id}/ics`}
            className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted hover:border-gold hover:text-gold"
          >
            .ics
          </a>
        </div>
      )}

      {isRescheduling && setNewStart && confirmReschedule && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="border border-border bg-bg px-2 py-1.5 text-sm outline-none focus:border-gold"
          />
          <button
            onClick={confirmReschedule}
            className="bg-gold px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-bg"
          >
            Сохранить
          </button>
        </div>
      )}
    </article>
  );
}
