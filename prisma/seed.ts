import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  {
    name: "Мужская стрижка",
    description: "Классическая или современная стрижка с консультацией, мытьём и укладкой.",
    price: 3000,
    durationMin: 45,
    sortOrder: 1,
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
  },
  {
    name: "Стрижка бороды",
    description: "Моделирование бороды и усов, контур, горячее полотенце.",
    price: 2000,
    durationMin: 30,
    sortOrder: 2,
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
  },
  {
    name: "Комплекс",
    description: "Стрижка + борода: полный образ за один визит.",
    price: 4500,
    durationMin: 70,
    sortOrder: 3,
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
  },
  {
    name: "Детская стрижка",
    description: "Стрижка для детей до 12 лет в комфортной атмосфере.",
    price: 2500,
    durationMin: 30,
    sortOrder: 4,
    imageUrl: "https://images.unsplash.com/photo-1485832329521-e944d75fa65e?w=800&q=80",
  },
  {
    name: "Камуфляж седины",
    description: "Мягкое тонирование седины без резкого эффекта окрашивания.",
    price: 2000,
    durationMin: 25,
    sortOrder: 5,
    imageUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&q=80",
  },
  {
    name: "Уход за лицом",
    description: "Очищение, чёрная маска / уход, тоник и увлажнение.",
    price: 2500,
    durationMin: 30,
    sortOrder: 6,
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
  },
  {
    name: "Массаж головы",
    description: "Расслабляющий массаж кожи головы после стрижки или отдельно.",
    price: 1500,
    durationMin: 15,
    sortOrder: 7,
    imageUrl: "https://images.unsplash.com/photo-1519415387722-a1c3bbef9c65?w=800&q=80",
  },
];

const BARBERS = [
  {
    name: "Арман",
    specialization: "Фейды · современные стрижки",
    bio: "Любит чёткие линии и аккуратный fade. Работает с мужскими и подростковыми стрижками.",
    photoUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80",
    workStart: 10,
    workEnd: 21,
  },
  {
    name: "Данияр",
    specialization: "Борода · классика",
    bio: "Мастер бороды и классических мужских образов. Горячее полотенце — must.",
    photoUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80",
    workStart: 11,
    workEnd: 21,
  },
  {
    name: "Нурлан",
    specialization: "Комплекс · уход",
    bio: "Полный сервис: стрижка, борода, уход за лицом. Спокойный и внимательный.",
    photoUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80",
    workStart: 10,
    workEnd: 20,
  },
  {
    name: "Ерлан",
    specialization: "Детские · камуфляж",
    bio: "Легко находит общий язык с детьми, аккуратно работает с камуфляжем седины.",
    photoUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80",
    workStart: 12,
    workEnd: 21,
  },
];

const PORTFOLIO = [
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=900&q=80",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=900&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&q=80",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=900&q=80",
  "https://images.unsplash.com/photo-1493256338651-d82f8554dab0?w=900&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80",
];

const BRANCHES = [
  {
    name: "Bazooka · Желтоксан 76",
    address: "ул. Желтоксан, 76, Тараз",
    phone: "+77081991080",
    hours: "Ежедневно 10:00–21:00",
    mapUrl: "https://2gis.kz/taraz/firm/70000001051542585",
    isPrimary: true,
  },
  {
    name: "Bazooka · Желтоксан 132",
    address: "ул. Желтоксан, 132, Тараз",
    phone: "+77081991080",
    hours: "Ежедневно 10:00–21:00",
    mapUrl: "https://2gis.kz/taraz/branches/70000001098253847",
    isPrimary: false,
  },
  {
    name: "Bazooka · Койгельды 175Б",
    address: "ул. Колбасшы Койгельды, 175Б, Тараз",
    phone: "+77081991080",
    hours: "Ежедневно 10:00–21:00",
    mapUrl: "https://2gis.kz/taraz/firm/70000001056438286",
    isPrimary: false,
  },
];

async function main() {
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.barberService.deleteMany();
  await prisma.portfolioImage.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();

  const services = [];
  for (const s of SERVICES) {
    services.push(await prisma.service.create({ data: s }));
  }

  const barbers = [];
  for (const b of BARBERS) {
    barbers.push(await prisma.barber.create({ data: b }));
  }

  for (const barber of barbers) {
    for (const service of services) {
      await prisma.barberService.create({
        data: { barberId: barber.id, serviceId: service.id },
      });
    }
  }

  for (let i = 0; i < PORTFOLIO.length; i++) {
    await prisma.portfolioImage.create({
      data: {
        imageUrl: PORTFOLIO[i],
        caption: "Работа мастеров Bazooka",
        sortOrder: i,
        barberId: barbers[i % barbers.length].id,
      },
    });
  }

  for (const branch of BRANCHES) {
    await prisma.branch.create({ data: branch });
  }

  console.log("Seed complete:");
  console.log(`  ${services.length} services`);
  console.log(`  ${barbers.length} barbers`);
  console.log(`  ${BRANCHES.length} branches`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
