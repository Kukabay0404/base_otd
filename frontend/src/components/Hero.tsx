"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const images = [
  "https://gubdaily.ru/wp-content/uploads/2021/07/38a7c3a072849af1c0319.jpg",
  "https://avatars.mds.yandex.net/get-altay/5115998/2a0000018ec1c12360bec6d53cad7ae16082/orig",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [showGuests, setShowGuests] = useState(false);
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // авто-слайд
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % images.length);
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + images.length) % images.length);

  const updateRoom = (index: number, type: "adults" | "children", value: number) => {
    setRooms((prev) =>
      prev.map((room, i) =>
        i === index
          ? { ...room, [type]: Math.max(type === "adults" ? 1 : 0, value) }
          : room
      )
    );
  };

  const addRoom = () => setRooms((prev) => [...prev, { adults: 1, children: 0 }]);
  const removeRoom = (index: number) =>
    setRooms((prev) => prev.filter((_, i) => i !== index));

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

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Слайд-шоу */}
      <div className="absolute inset-0">
        <AnimatePresence>
          <motion.img
            key={current}
            src={images[current]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Текст поверх */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center text-white max-w-2xl"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Насладитесь отдыхом в гармонии с природой
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Уютные домики, тишина леса и комфорт для всей семьи
        </p>
        <Link
          href="/booking"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl shadow-lg text-lg text-white inline-block text-center"
        >
          Забронировать номер
        </Link>
      </motion.div>

      {/* Стрелки */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Форма бронирования */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="absolute bottom-8 w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4 z-20"
      >
        {/* Заезд */}
        <div className="flex-1">
          <label className="block text-gray-600 text-sm">Заезд</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Выезд */}
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
        <div className="flex-1 relative">
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
              className="absolute bottom-full mb-2 left-0 w-full max-w-sm bg-white shadow-lg rounded-xl border p-4 z-30"
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
                        onClick={() => removeRoom(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑
                      </button>
                    )}
                  </div>

                  {/* Взрослые */}
                  <div className="flex justify-between items-center mb-3">
                    <span>Взрослые</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateRoom(index, "adults", room.adults - 1)
                        }
                        className="px-3 py-1 border rounded-lg"
                        disabled={room.adults <= 1}
                      >
                        –
                      </button>
                      <span>{room.adults}</span>
                      <button
                        onClick={() =>
                          updateRoom(index, "adults", room.adults + 1)
                        }
                        className="px-3 py-1 border rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Дети */}
                  <div className="flex justify-between items-center">
                    <span>Дети (до 18)</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateRoom(index, "children", room.children - 1)
                        }
                        className="px-3 py-1 border rounded-lg"
                        disabled={room.children <= 0}
                      >
                        –
                      </button>
                      <span>{room.children}</span>
                      <button
                        onClick={() =>
                          updateRoom(index, "children", room.children + 1)
                        }
                        className="px-3 py-1 border rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addRoom}
                className="w-full border border-green-600 text-green-600 py-2 rounded-lg mb-3 hover:bg-green-50"
              >
                + Добавить номер
              </button>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowGuests(false)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Промокод */}
        <div className="flex-1">
          <label className="block text-gray-600 text-sm">Промокод</label>
          <input
            type="text"
            placeholder="Введите промокод"
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Кнопка */}
        <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white self-end md:self-center">
          Найти номер
        </button>
      </motion.div>
    </section>
  );
}
