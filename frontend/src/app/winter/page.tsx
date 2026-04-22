import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media";

export default function WinterPage() {
  const activities = [
    {
      img: "winter/index/ski-snowboard.jpg",
      title: "Лыжи и Сноуборд",
      desc: "Экстремальные заезды по лесным тропам",
      href: "/winter/ski",
    },
    {
      img: "winter/index/skating.jpg",
      title: "Коньки",
      desc: "Прогулки на свежем воздухе",
      href: "/winter/skating",
    },
    {
      img: "winter/index/snowmobile.jpg",
      title: "Прокат снегохода",
      desc: "Отдых для всей семьи",
      href: "/winter/snowmobile",
    },
  ];

  return (
    <div className="bg-white text-gray-900 pt-12">
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src={resolveMediaUrl("winter/index/hero.jpg")}
          alt="Зимний отдых"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Зимний отдых</h1>
          <p className="text-xl mb-6">Лыжи и сноуборд, коньки и прокат снегохода</p>
          <a
            href="#activities"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-lg font-semibold"
          >
            Смотреть активности
          </a>
        </div>
      </section>

      <section id="activities" className="py-16 container mx-auto px-6 lg:px-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Выберите активность</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {activities.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl overflow-hidden shadow-lg relative"
            >
              <img
                src={resolveMediaUrl(item.img)}
                alt={item.title}
                className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-16 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Отдых для всей семьи</h2>
          <p className="text-gray-700 text-lg">
            Зимой у нас найдется занятие для каждого: от активного спорта до спокойного отдыха на природе.
            Уютная атмосфера, свежий воздух и современная инфраструктура делают наш курорт идеальным местом
            для незабываемого отдыха.
          </p>
        </div>
      </section>
    </div>
  );
}
