import { Suspense } from "react";
import { BookingWizard } from "@/components/BookingWizard";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-10 text-muted">Загрузка...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
