// app/cabins/page.tsx
"use client";

import Link from "next/link";

const cabins = [
  {
    id: 1,
    title: "Сруб Малый",
    description: "Уютный деревянный сруб для небольшой компании или семьи.",
    image: "https://mirturbaz.ru/uploads/picture/pic/241550/big_image.jpg",
    price: "25 000 тг/день",
  },
  {
    id: 2,
    title: "Сруб Средний",
    description: "Просторный сруб с камином и кухней для комфортного отдыха.",
    image: "https://i.ytimg.com/vi/OWvfDVov9CU/maxresdefault.jpg",
    price: "40 000 тг/день",
  },
  {
    id: 3,
    title: "Сруб Большой",
    description: "Большой сруб для компании или нескольких семей.",
    image: "https://i.pinimg.com/736x/4d/1e/67/4d1e67faa031efe665211d2ff651d633.jpg",
    price: "60 000 тг/день",
  },
];

function CabinCard({ cabin }: { cabin: (typeof cabins)[0] }) {
  return (
    <div className="border rounded-2xl shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={cabin.image}
        alt={cabin.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-6 space-y-3">
        <h2 className="text-xl font-semibold">{cabin.title}</h2>
        <p className="text-gray-600">{cabin.description}</p>
        <p className="text-green-700 font-bold">{cabin.price}</p>
      </div>
    </div>
  );
}

export default function CabinsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16">
      {/* Навигация */}
      <div className="flex justify-center gap-6 mb-8">
        <Link href="/rooms">
          <button className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 shadow">
            Номера
          </button>
        </Link>
        <Link href="/cabins">
          <button className="px-6 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 shadow">
            Срубы
          </button>
        </Link>
      </div>

      {/* Карточки срубов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cabins.map((cabin) => (
          <CabinCard key={cabin.id} cabin={cabin} />
        ))}
      </div>
    </div>
  );
}
