"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/media";


const images = [
  "homepage/110d0083003b.jpg",
  "homepage/66485a7cf828.jpg",
  "homepage/66485a7cf828.jpg",
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  // ---- Состояние для гостей ----
  const [showGuests, setShowGuests] = useState(false);
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const guestsRef = useRef<HTMLDivElement>(null);

  const updateRoom = (index: number, type: "adults" | "children", value: number) => {
    setRooms((prev) =>
      prev.map((room, i) =>
        i === index ? { ...room, [type]: Math.max(type === "adults" ? 1 : 0, value) } : room
      )
    );
  };

  const addRoom = () => {
    setRooms((prev) => [...prev, { adults: 1, children: 0 }]);
  };

  const removeRoom = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const guestsSummary = rooms
    .map(
      (room, i) =>
        `Номер ${i + 1}: ${room.adults} взрослых${
          room.children > 0 ? `, ${room.children} детей` : ""
        }`
    )
    .join("; ");

  const bookingHref = (() => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", new Date(checkIn).toISOString());
    if (checkOut) params.set("checkOut", new Date(checkOut).toISOString());
    params.set("guests", JSON.stringify(rooms));
    return `/booking?${params.toString()}`;
  })();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setShowGuests(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <main className="w-full min-h-screen bg-white text-gray-800 relative">
      {/* Hero Section with Slideshow */}
      <section className="relative flex min-h-[860px] flex-col items-center justify-center overflow-hidden sm:min-h-screen">
        {/* Слайд-шоу */}
        <div className="absolute inset-0">
          <AnimatePresence>
            <motion.img
              key={current}
              src={resolveMediaUrl(images[current])}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Контент поверх */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-2xl px-4 text-center text-white"
        >
          <h1 className="mb-3 text-3xl font-bold sm:text-4xl md:mb-4 md:text-6xl">
            Насладитесь отдыхом в гармонии с природой
          </h1>
          <p className="mb-5 text-base sm:text-lg md:mb-6 md:text-xl">
            Уютные домики, тишина леса и комфорт для всей семьи
          </p>
          <Link href="/booking">
            <button className="rounded-xl bg-green-600 px-5 py-3 text-base shadow-lg hover:bg-green-700 sm:px-6 sm:text-lg">
              Забронировать номер
            </button>
          </Link>
        </motion.div>

        {/* Стрелки переключения */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:left-6 sm:block sm:p-3"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:right-6 sm:block sm:p-3"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Форма бронирования */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="absolute bottom-3 left-3 right-3 z-20 flex w-auto flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg sm:bottom-8 sm:left-1/2 sm:w-[calc(100%-2rem)] sm:max-w-4xl sm:-translate-x-1/2 sm:gap-4 sm:p-6 md:flex-row"
        >
          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Заезд</label>
                        <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Выезд</label>
                        <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Гости */}
          <div className="flex-1 relative" ref={guestsRef}>
            <label className="block text-gray-600 text-sm">Гости</label>
            <div
              onClick={() => setShowGuests(!showGuests)}
              className="w-full border rounded-lg p-2 cursor-pointer bg-white"
            >
              {guestsSummary}
            </div>

            {showGuests && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 z-30 mb-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl border bg-white p-4 shadow-lg"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <h3 className="text-lg font-semibold mb-3">Количество гостей</h3>

                {rooms.map((room, index) => (
                  <div
                    key={index}
                    className="mb-4 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Номер {index + 1}</p>
                      {rooms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <span>Взрослые</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(index, "adults", room.adults - 1)}
                          className="px-3 py-1 border rounded-lg"
                          disabled={room.adults <= 1}
                        >
                          -
                        </button>
                        <span>{room.adults}</span>
                        <button
                          type="button"
                          onClick={() => updateRoom(index, "adults", room.adults + 1)}
                          className="px-3 py-1 border rounded-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>Дети (до 18)</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoom(index, "children", room.children - 1)}
                          className="px-3 py-1 border rounded-lg"
                          disabled={room.children <= 0}
                        >
                          -
                        </button>
                        <span>{room.children}</span>
                        <button
                          type="button"
                          onClick={() => updateRoom(index, "children", room.children + 1)}
                          className="px-3 py-1 border rounded-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRoom}
                  className="w-full border border-green-600 text-green-600 py-2 rounded-lg mb-3 hover:bg-green-50"
                >
                  + Добавить номер
                </button>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGuests(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Готово
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Промокод</label>
            <input
              type="text"
              placeholder="Введите промокод"
              className="w-full border rounded-lg p-2"
            />
          </div>
          <Link href={bookingHref} className="w-full md:w-auto">
            <button className="w-full rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700 md:w-auto md:self-center">
              Найти номер
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Секция Дома = "Рћ базе" */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6">
          <div>
            <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/110d0083003b.jpg")}
              alt="Большие дома"
              className="rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Большие деревянные дома</h2>
            <p className="text-gray-700 mb-6">
              Уютные деревянные дома для больших компаний и семей.
              Вместимость до 10 человек, просторные гостиные и собственная кухня.
            </p>
            <a href="/booking" className="text-blue-700 font-semibold hover:underline">
              Подробнее →
            </a>
          </div>
        </div>
      </section>

      {/* Секция Природа */}
      <section id="accommodation" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold mb-4">
              Природа и территория
            </h2>
            <p className="text-gray-700 mb-6">
              База отдыха окружена хвойным лесом и чистым озером.
              Здесь можно насладиться тишиной и красотой природы.
            </p>
            <video controls preload="metadata" className="rounded-2xl shadow-lg w-full">
              <source src={resolveMediaUrl("homepage/nature.mp4")} type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          <div className="order-1 md:order-2">
            <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/nature1.jpg")}
              alt="Природа"
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Секция Ресторан */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6">
          <div>
            <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/eb69d2216306.png")}
              alt="Ресторан"
              className="rounded-2xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">Ресторан</h2>
            <p className="text-gray-700 mb-6">
              На территории базы работает ресторан, где подают блюда национальной и европейской кухни.
            </p>
            <a href="/restaurant" className="text-blue-700 font-semibold hover:underline">
              Посмотреть меню →
            </a>
          </div>
        </div>
      </section>

      {/* Секция Активности */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">Активности</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/299594cda2a2.jpg")} alt="Баня" className="rounded-xl mb-4" />
              <h3 className="font-semibold">Баня</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/bdad3b29c7a5.jpg")} alt="Прогулки" className="rounded-xl mb-4" />
              <h3 className="font-semibold">Прогулки на лошадях</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/44babb782dab.jpg")} alt="Рыбалка" className="rounded-xl mb-4" />
              <h3 className="font-semibold">Рыбалка</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-lg">
              <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/0f0244d6800a.jpg")} alt="Детская площадка" className="rounded-xl mb-4" />
              <h3 className="font-semibold">Детская площадка</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Заголовок */}
          <h2 className="text-3xl font-bold mb-6">
            Подберем индивидуальную программу досуга по вашему запросу
          </h2>
          <p className="text-gray-600 mb-12">
            Мы всегда рады вам предложить различные виды активного отдыха
          </p>

          {/* Карточки */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Link href="/summer">
                <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/a37ddcf0e3b2.jpg")}
                  alt="Летний отдых"
                  className="w-full h-64 object-cover cursor-pointer"
                />
              </Link>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                <h3 className="text-xl font-semibold">Летний отдых</h3>
                <p className="text-sm">6 видов активностей</p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <Link href="/winter">
              <img loading="lazy" decoding="async" src={resolveMediaUrl("homepage/5925d31146ff.jpg")}
                alt="Зимний отдых"
                className="w-full h-64 object-cover cursor-pointer"
              />
              </Link>
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent text-white p-4">
                <h3 className="text-xl font-semibold">Зимний отдых</h3>
                <p className="text-sm">8 видов активностей</p>
              </div>
            </div>
          </div>

          {/* Текстовый блок */}
          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold mb-4">
              Отличное место для отдыха всей семьи и проведения праздника
            </h3>
            <p className="text-gray-600">
              Современные залы идеально подойдут для проведения мероприятия любого
              формата и масштаба на высшем уровне.
            </p>
          </div>
        </div>
      </section>

      {/* Секция Фотогалерея */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">
            Фотогалерея базы отдыха
          </h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">
            Атмосфера уюта, природы и комфорта в каждом уголке
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/66485a7cf828.jpg")}
              loading="lazy"
              decoding="async"
              alt="Домики"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/110d0083003b.jpg")}
              loading="lazy"
              decoding="async"
              alt="Беседки"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/nature1.jpg")}
              loading="lazy"
              decoding="async"
              alt="Природа"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/eb69d2216306.png")}
              loading="lazy"
              decoding="async"
              alt="Ресторан"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/44babb782dab.jpg")}
              loading="lazy"
              decoding="async"
              alt="Рыбалка"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
            <motion.img
              whileHover={{ scale: 1.05 }}
              src={resolveMediaUrl("homepage/0f0244d6800a.jpg")}
              loading="lazy"
              decoding="async"
              alt="Детская площадка"
              className="rounded-2xl shadow-lg w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Секция Карта */}
      <section id="contacts" className="bg-teal-900 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-10 md:mb-0 md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">
              Запланируйте отдых в одном из самых уютных уголков Казахстана
            </h2>
            <p className="mb-6 text-lg text-gray-200">
              Примерное время в пути от Караганды до зоны отдыха «Лесное Озеро» — 20 минут.
            </p>
            <a
              href="https://2gis.kz/astana/search/Зона%20отдыха%20BalQaragai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-teal-900 transition"
            >
              Как добраться
            </a>
          </div>

          {/* Пример карты через iframe */}
          <div className="md:w-1/2 h-72 w-full rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://widgets.2gis.com/widget?type=firmsonmap&options[company_ids]=70000001067831063&options[zoom]=12"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

    {/* Футер */}
    <footer className="bg-gray-100 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Контакты */}
        <div>
          <h3 className="font-semibold mb-4">Контакты</h3>
          <p>Зона отдыха «Лесное Озеро»</p>
          <p>Караганда, Малотимофеевка-2</p>
          <p className="mt-2">Отдел продаж: <a href="tel:+77750070030" className="hover:underline">+7 775 007 00 30</a></p>
          <p>Ресепшн: <a href="tel:+77750070037" className="hover:underline">+7 775 007 00 37</a></p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="p-2 border rounded-full hover:bg-teal-900 hover:text-white transition">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        {/* Проживание */}
        <div>
          <h3 className="font-semibold mb-4">Проживание</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Номера</a></li>
            <li><a href="#" className="hover:underline">Срубы</a></li>
          </ul>
        </div>

        {/* Зимний отдых */}
        <div>
          <h3 className="font-semibold mb-4">Зимний отдых</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Лыжи</a></li>
            <li><a href="#" className="hover:underline">Коньки</a></li>
            <li><a href="#" className="hover:underline">Сноуборд</a></li>
            <li><a href="#" className="hover:underline">Катание на хаски</a></li>
            <li><a href="#" className="hover:underline">Прокат снегохода</a></li>
          </ul>
        </div>

        {/* Летний отдых */}
        <div>
          <h3 className="font-semibold mb-4">Летний отдых</h3>
          <ul className="space-y-2">
            <li><a href="#" className="hover:underline">Аквапарк и бассейн</a></li>
            <li><a href="#" className="hover:underline">Футбол, пейнтбол, велосипеды</a></li>
            <li><a href="#" className="hover:underline">Квадроциклы</a></li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-12">
        В© {new Date().getFullYear()} Лесное Озеро. Все права защищены.
      </div>
    </footer>

    </main>
  );
}



