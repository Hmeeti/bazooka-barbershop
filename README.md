# Bazooka Barbershop — онлайн-запись

Стильный веб-сервис для барбершопа **Bazooka** (Тараз): лендинг, каталог услуг, мастера, онлайн-запись, личный кабинет и email-напоминания.

Источник бренда: [instagram.com/bazooka.barbershop](https://www.instagram.com/bazooka.barbershop)

## Стек

- **Frontend:** Next.js 16 (App Router) + Tailwind CSS 4 + React 19
- **Backend:** Next.js Route Handlers
- **DB:** SQLite + Prisma 5
- **Auth:** JWT (jose) в httpOnly cookie, регистрация / пароль / OTP
- **Email:** Nodemailer (SMTP) + console-fallback в dev
- **Cron:** `node-cron` worker + HTTP endpoint `/api/cron/reminders`

## Архитектура БД

```
User ──────────< Appointment >──────── Barber
                     │
                     └──< AppointmentService >── Service

Barber >── BarberService <── Service
Barber >── PortfolioImage
User   >── OtpCode
Branch (адреса филиалов)
```

| Модель | Назначение |
|--------|------------|
| `User` | Клиенты (имя, телефон, email, пароль) |
| `Service` | Услуги, цена (₸), длительность |
| `Barber` | Мастера, график `workStart`–`workEnd` |
| `Appointment` | Записи + флаги `reminder24Sent` / `reminder2hSent` |
| `Branch` | Филиалы (Желтоксан 76/132, Койгельды 175Б) |

## Роутинг

| Путь | Описание |
|------|----------|
| `/` | Landing: hero, услуги, мастера, галерея, контакты |
| `/booking` | 5-шаговый booking flow |
| `/auth/login` | Email/пароль или OTP |
| `/auth/register` | Регистрация |
| `/cabinet` | Предстоящие / история, отмена, перенос |
| `/api/catalog` | Услуги, мастера, портфолио, филиалы |
| `/api/slots` | Свободные слоты |
| `/api/appointments` | CRUD записей + confirmation email |
| `/api/appointments/[id]/ics` | Apple Calendar файл |
| `/api/cron/reminders` | Напоминания за 24ч и 2–3ч |

## Быстрый старт

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Email в development

Если `SMTP_HOST` пустой — письма печатаются в **консоль сервера** (включая OTP и подтверждения).

Для продакшена заполните `.env` (см. `.env.example`):

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_xxx
SMTP_FROM="Bazooka Barbershop <noreply@yourdomain.com>"
```

### Cron-напоминания

Отдельный процесс:

```bash
npm run cron
```

Или HTTP (каждые 15 минут из внешнего планировщика):

```bash
curl -H "x-cron-secret: $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

## Booking flow

1. Выбор одной или нескольких услуг  
2. Мастер или «Любой свободный»  
3. Дата + свободный слот (учёт графика и занятых записей)  
4. Авторизация (если не вошли)  
5. Подтверждение → email + кнопки Google / Apple Calendar  

## Дизайн

Тёмный премиальный барбершоп-стиль: `#0B0B0B` / золотой акцент `#C4A574`, шрифты Bebas Neue + DM Sans, mobile-first.

## Данные

Прайс и адреса собраны из публичных источников (2ГИС / карты) и типового меню барбершопа; Instagram API недоступен без токена — портфолио использует тематические фото-плейсхолдеры. После получения Instagram Graph API можно подменить seed.

## Скрипты

| Команда | Действие |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production build |
| `npm run db:seed` | Сиды услуг/мастеров |
| `npm run cron` | Worker напоминаний |
| `npm run db:studio` | Prisma Studio |
