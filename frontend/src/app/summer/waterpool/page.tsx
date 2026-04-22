"use client";

import { useState } from "react";
import { resolveMediaUrl } from "@/lib/media";

const waterpoolImages = {
  banner: "summer/waterpool/banner.jpg",
  action: "summer/waterpool/action.jpg",
  gallery: [
    "summer/waterpool/gallery1.jpg",
    "summer/waterpool/gallery2.jpg",
    "summer/waterpool/gallery3.jpg",
  ],
};

export default function AquaparkCatalogPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [people, setPeople] = useState(2);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setDate("");
    setTime("");
    setPeople(2);

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white text-gray-900 pt-12">
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src={resolveMediaUrl(waterpoolImages.banner)}
          alt="Аквапарк и бассейн"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Аквапарк и бассейн</h1>
          <p className="text-xl mb-6">Идеальное место для летнего отдыха</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Веселье и отдых для всей семьи</h2>
          <p className="text-lg leading-relaxed mb-6">
            У нас вы найдете просторный бассейн и современный аквапарк с водными горками
            для детей и взрослых. Идеальное место для отдыха в жаркие дни,
            семейных выходных или дружеских компаний.
          </p>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>Большой бассейн для плавания</li>
            <li>Детская зона с мини-горками</li>
            <li>Водные аттракционы для взрослых</li>
            <li>Зоны для отдыха и загара</li>
          </ul>
        </div>
        <div>
          <img
            src={resolveMediaUrl(waterpoolImages.action)}
            alt="Аквапарк"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Фотогалерея</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img
              src={resolveMediaUrl(waterpoolImages.gallery[0])}
              alt="Аквапарк фото 1"
              className="rounded-xl shadow-md"
            />
            <img
              src={resolveMediaUrl(waterpoolImages.gallery[1])}
              alt="Аквапарк фото 2"
              className="rounded-xl shadow-md"
            />
            <img
              src={resolveMediaUrl(waterpoolImages.gallery[2])}
              alt="Аквапарк фото 3"
              className="rounded-xl shadow-md"
            />
          </div>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-3xl mx-auto px-6 bg-white rounded-2xl shadow-xl p-8 border">
          <h2 className="text-3xl font-bold text-center mb-6">Забронировать посещение</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 mb-2">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Время</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Количество гостей</label>
              <input
                type="number"
                min="1"
                max="20"
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg"
            >
              Забронировать
            </button>
          </form>
        </div>

        {success && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg animate-fade-in-out">
            Заявка отправлена!
          </div>
        )}
      </section>
    </div>
  );
}
