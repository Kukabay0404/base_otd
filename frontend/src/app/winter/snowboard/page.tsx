// app/snowboard/page.tsx
"use client";

import { motion } from "framer-motion";

export default function SnowboardPage() {
  return (
    <main className="w-full min-h-screen bg-gray-900 text-gray-100">
      {/* Отступ сверху */}
      <div className="h-12" />

      {/* Hero-блок */}
      <section
        className="relative h-[75vh] flex items-center justify-center bg-cover bg-center rounded-b-3xl overflow-hidden shadow-xl"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1549887534-3db1bd59dcca?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-6xl md:text-7xl font-extrabold text-white drop-shadow-lg uppercase">
            Сноуборд
          </h1>
          <p className="mt-4 text-2xl text-white/90 drop-shadow">
            Свобода, скорость и незабываемые спуски
          </p>
        </motion.div>
      </section>

      {/* Описание */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">
          Адреналин на склонах
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed mb-6">
          Катание на сноуборде — это не просто спорт, это стиль жизни. 
          У нас подготовлены трассы разного уровня сложности: от лёгких для новичков 
          до экстремальных для опытных райдеров.  
          На месте вы можете взять снаряжение напрокат или пройти обучение с инструктором.
        </p>
      </section>

      {/* Галерея */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        {[
          "https://images.unsplash.com/photo-1517821099601-1a64e8d8d63d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80",
        ].map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden shadow-lg bg-gray-800"
          >
            <img
              src={src}
              alt={`Сноуборд ${i + 1}`}
              className="w-full h-64 object-cover"
            />
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white text-center py-12">
        <h2 className="text-3xl font-bold mb-4">
          Готовы к настоящему драйву?
        </h2>
        <p className="mb-6 text-lg">
          Забронируйте занятия или аренду сноуборда прямо сейчас!
        </p>
        <a href="/booking">
          <button className="bg-white text-indigo-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold shadow-lg">
            Забронировать
          </button>
        </a>
      </section>
    </main>
  );
}
