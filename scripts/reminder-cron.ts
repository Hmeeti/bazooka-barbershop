/**
 * Standalone cron worker for email reminders.
 * Run: npx tsx scripts/reminder-cron.ts
 *
 * Every 15 minutes hits the reminder processor (24h + 2–3h windows).
 */
import cron from "node-cron";
import { processReminders } from "../src/lib/reminders";

console.log("[cron] Bazooka reminder worker started");

async function tick() {
  try {
    const result = await processReminders();
    console.log(`[cron] ${new Date().toISOString()}`, result);
  } catch (e) {
    console.error("[cron] error", e);
  }
}

tick();
cron.schedule("*/15 * * * *", tick);
