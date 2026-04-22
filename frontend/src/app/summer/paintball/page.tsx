// app/catalog/paintball/page.tsx

"use client";

import { useState } from "react";

export default function PaintballCatalogPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [players, setPlayers] = useState(6);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setDate("");
    setTime("");
    setPlayers(6);

    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white text-gray-900 pt-12">
      {/* Баннер */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <img
          src="https://static.tildacdn.com/tild6631-3233-4734-b230-646632623135/1.jpg"
          alt="Пейнтбол"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-5xl font-bold mb-4">Пейнтбол</h1>
          <p className="text-xl mb-6">Адреналин, драйв и командная игра</p>
        </div>
      </section>

      {/* Блок с описанием */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Яркие эмоции на природе</h2>
          <p className="text-lg leading-relaxed mb-6">
            Пейнтбол — это идеальный способ активно провести время с друзьями,
            коллегами или семьёй. На территории базы оборудована специальная
            площадка для игр, где вас ждут укрытия, препятствия и всё
            необходимое снаряжение.
          </p>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>Оборудованная площадка</li>
            <li>Выдача защитного снаряжения</li>
            <li>Профессиональные инструкторы</li>
            <li>Идеально для корпоративных игр</li>
          </ul>
        </div>
        <div>
          <img
            src="http://socialpaintball.com/wp-content/uploads/2013/07/upton187crewpaintballphoto.jpg"
            alt="Пейнтбол игра"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Галерея */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Фотогалерея</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img
              src="http://socialpaintball.com/wp-content/uploads/2013/07/upton187crewpaintballphoto.jpg"
              alt="Paintball 1"
              className="rounded-xl shadow-md"
            />
            <img
              src="https://www.davanusala.lv/58314/9172.jpg"
              alt="Paintball 2"
              className="rounded-xl shadow-md"
            />
            <img
              src="https://avatars.mds.yandex.net/i?id=ba3dac62164fc05618d1e80509e70d73_l-12623687-images-thumbs&n=13"
              alt="Paintball 3"
              className="rounded-xl shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Форма бронирования */}
      <section className="py-16 relative">
        <div className="max-w-3xl mx-auto px-6 bg-white rounded-2xl shadow-xl p-8 border">
          <h2 className="text-3xl font-bold text-center mb-6">
            Забронировать игру
          </h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Дата */}
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

            {/* Время */}
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

            {/* Количество игроков */}
            <div>
              <label className="block text-gray-700 mb-2">
                Количество участников
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
                required
              />
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg"
            >
              Забронировать
            </button>
          </form>
        </div>

        {/* Уведомление */}
        {success && (
          <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg animate-fade-in-out">
            ✅ Заявка отправлена!
          </div>
        )}
      </section>
    </div>
  );
}
