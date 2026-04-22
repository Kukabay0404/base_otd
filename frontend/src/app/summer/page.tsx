import Link from "next/link";

export default function SummerPage() {
  
    const activities = [
    { img: "https://i.ytimg.com/vi/_UM0ux6fJvQ/maxresdefault.jpg", title: "Квадроциклы", desc: "Экстремальные заезды по лесным тропам", href: "/summer/quad" },
    { img: "https://sport.photosota.club/uploads/posts/2024-04/9212/1713008705_sport-photosota-club-32ro-p-velogonka-v-lesu-25.jpg", title: "Велосипеды", desc: "Прогулки на свежем воздухе", href: "/summer/bike" },
    { img: "https://cdn.culture.ru/images/8aaf8f74-0896-53c9-a8c1-3db3b89b7f7b", title: "Футбол", desc: "Поле для игр и турниров", href: "/summer/football" },
    { img: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/SupAir_Player.jpg/1200px-SupAir_Player.jpg", title: "Пейнтбол", desc: "Активные командные сражения", href: "/summer/paintball" },
    { img: "https://static.bangkokpost.com/media/content/dcx/2021/10/09/4109979.jpg", title: "Аквапарк и бассейн", desc: "Отдых для всей семьи", href: "/summer/waterpool" },
  ];

  return (
    <div className="bg-white text-gray-900 pt-12">
      {/* Баннер */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src="https://i.pinimg.com/originals/42/3a/ef/423aef2e4fbaf05aa0ffd67b309d6d8d.jpg "
          alt="Летний отдых"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Летний отдых</h1>
          <p className="text-xl mb-6">Квадроциклы, бассейн, спорт и развлечения на природе</p>
          <a
            href="#activities"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-lg font-semibold"
          >
            Смотреть активности
          </a>
        </div>
      </section>

      {/* Каталог активностей */}
      <section className="py-16 container mx-auto px-6 lg:px-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Выберите активность</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {activities.map((item, idx) => (
            <Link key={idx} href={item.href} className="group rounded-2xl overflow-hidden shadow-lg relative">
              <img
                src={item.img}
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

      {/* Описание */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-16 text-center max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Отдых для всей семьи</h2>
          <p className="text-gray-700 text-lg">
            Летом у нас найдется занятие для каждого: от активного спорта до спокойного отдыха у воды. 
            Уютная атмосфера, свежий воздух и современная инфраструктура делают наш курорт идеальным местом 
            для незабываемого отдыха.
          </p>
        </div>
      </section>
    </div>
  );
}
