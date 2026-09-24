import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const dm = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "Bazooka Barbershop — онлайн-запись",
  description:
    "Стильный барбершоп в Таразе. Запись онлайн: стрижки, борода, комплекс, детская стрижка.",
  openGraph: {
    title: "Bazooka Barbershop",
    description: "Онлайн-запись в барбершоп Bazooka",
    locale: "ru_KZ",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${bebas.variable} ${dm.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
