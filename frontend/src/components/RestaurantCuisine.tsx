// components/RestaurantCuisine.tsx

"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import { Utensils, Clock } from "lucide-react";

const dishes = [
  {
    name: "Баранья рулька",
    image: "/images/cuisine/dish1.jpg",
  },
  {
    name: "Жареные манты",
    image: "/images/cuisine/dish2.jpg",
  },
  {
    name: "Медальоны из говядины",
    image: "/images/cuisine/dish3.jpg",
  },
  {
    name: "Салат с авокадо",
    image: "/images/cuisine/dish4.jpg",
  },
];

export default function RestaurantCuisine() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h2 className="text-2xl font-bold text-center mb-2">ПОБАЛУЙТЕ СЕБЯ ИЗЫСКАННЫМИ БЛЮДАМИ НАШЕЙ КУХНИ</h2>
      <p className="text-center text-gray-600 mb-10">
        На выбор гостя национальная и восточная кухня.
      </p>

      {/* Слайдер */}
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={30}
        slidesPerView={3}
        loop
        className="mb-12"
      >
        {dishes.map((dish, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex flex-col items-center">
              <div className="w-full h-[300px] relative rounded-lg overflow-hidden shadow">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-lg text-gray-800">{dish.name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Информация */}
      <div className="flex justify-center gap-12 text-gray-700 mb-8">
        <div className="flex flex-col items-center">
          <Utensils className="mb-2" />
          <span className="text-sm">национальная,<br /> восточная кухня</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="mb-2" />
          <span className="text-sm">Время работы<br /> 09:00 — 23:00</span>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="mb-2" />
          <span className="text-sm">Завтрак<br /> 09:00 — 11:00</span>
        </div>
      </div>

      {/* Кнопка */}
      <div className="flex justify-center">
        <button className="border border-gray-800 px-6 py-2 rounded-lg hover:bg-gray-100 transition">
          Основное меню
        </button>
      </div>
    </section>
  );
}
