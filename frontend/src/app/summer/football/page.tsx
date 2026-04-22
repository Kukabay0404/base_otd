"use client";


import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";



const images = [
  "https://sportishka.com/uploads/posts/2022-11/1667432709_53-sportishka-com-p-futbolnoe-pole-meshcherskii-park-instagram-56.jpg",
  "https://cdn.culture.ru/images/8aaf8f74-0896-53c9-a8c1-3db3b89b7f7b",
  "https://realmadrid.one/wp-content/uploads/2018/02/1RM4744.jpg",
];

export default function FootballCatalogPage() {
  const [current, setCurrent] = useState(0);
  
    // Автоматическое переключение каждые 5 секунд
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

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [players, setPlayers] = useState(10);
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь можно будет подключить отправку данных на сервер
    setSuccess(true);
    setDate("");
    setTime("");
    setPlayers(10);

    // Закрыть уведомление через 3 секунды
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="w-full min-h-screen bg-white text-gray-800 relative">
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

        {/* Контент поверх */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white max-w-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Футбол
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Энергия спорта и командный дух
          </p>
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl shadow-lg text-lg">
            Забронировать номер
          </button>
        </motion.div>

        {/* Стрелки переключения */}
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
          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Заезд</label>
            <input type="date" className="w-full border rounded-lg p-2" />
          </div>
          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Выезд</label>
            <input type="date" className="w-full border rounded-lg p-2" />
          </div>

          {/* Гости */}
          <div className="flex-1 relative"></div>
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
                  style={{ maxHeight: "400px", overflowY: "auto" }} // ограничиваем высоту
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
                            onClick={() => updateRoom(index, "adults", room.adults - 1)}
                            className="px-3 py-1 border rounded-lg"
                            disabled={room.adults <= 1}
                          >
                            –
                          </button>
                          <span>{room.adults}</span>
                          <button
                            onClick={() => updateRoom(index, "adults", room.adults + 1)}
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
                            onClick={() => updateRoom(index, "children", room.children - 1)}
                            className="px-3 py-1 border rounded-lg"
                            disabled={room.children <= 0}
                          >
                            –
                          </button>
                          <span>{room.children}</span>
                          <button
                            onClick={() => updateRoom(index, "children", room.children + 1)}
                            className="px-3 py-1 border rounded-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Добавить номер */}
                  <button
                    onClick={addRoom}
                    className="w-full border border-green-600 text-green-600 py-2 rounded-lg mb-3 hover:bg-green-50"
                  >
                    + Добавить номер
                  </button>

                  {/* Готово */}
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



          <div className="flex-1">
            <label className="block text-gray-600 text-sm">Промокод</label>
            <input
              type="text"
              placeholder="Введите промокод"
              className="w-full border rounded-lg p-2"
            />
          </div>
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl text-white self-end md:self-center">
            Найти номер
          </button>
        </motion.div>
      </section>

    <div className="bg-white text-gray-900 pt-12">

      {/* Блок с описанием */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">Играем вместе</h2>
          <p className="text-lg leading-relaxed mb-6">
            Футбол — это не только спорт, но и отличный способ провести время 
            с друзьями и близкими. У нас оборудованное поле, подходящее для игр 
            как любительских команд, так и для активного отдыха гостей базы.
          </p>
          <ul className="list-disc list-inside text-lg space-y-2">
            <li>Современное травяное покрытие</li>
            <li>Возможность аренды инвентаря</li>
            <li>Проведение дружеских матчей</li>
            <li>Подходит для детей и взрослых</li>
          </ul>
        </div>
        <div>
          <img
            src="https://www.lintastour.ru/sites/default/files/public/styles/product_first/public/upload/products/futb.-stadion-zvezda.jpg.webp?itok=mrs7UbUD"
            alt="Футбольное поле"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Галерея */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Фотогалерея</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img src="https://avatars.mds.yandex.net/i?id=043aec04e6d95a6ea3f807d93c994424_l-5245904-images-thumbs&n=13" alt="Football 1" className="rounded-xl shadow-md" />
            <img src="https://images.stopgame.ru/uploads/users/2024/639535/r1694x948/A35xJZRAaJZNpeB5OwoDCw/00907.6uPgxJK.jpg" alt="Football 2" className="rounded-xl shadow-md" />
            <img src="https://www.uor-ekb.ru/upload/1239/cbd9008cebd8a241e195dab2106280aee19e6beb.jpeg" alt="Football 3" className="rounded-xl shadow-md" />
          </div>
        </div>
      </section>

      {/* Бронирование поля */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 bg-white rounded-2xl shadow-xl p-8 border">
          <h2 className="text-3xl font-bold text-center mb-6">Забронировать поле</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Дата */}
            <div>
              <label className="block text-gray-700 mb-2">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-3"
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
              />
            </div>

            {/* Количество игроков */}
            <div>
              <label className="block text-gray-700 mb-2">Количество игроков</label>
              <input
                type="number"
                min="2"
                max="22"
                value={players}
                onChange={(e) => setPlayers(Number(e.target.value))}
                className="w-full border rounded-lg p-3"
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
    </main>
  );
}
