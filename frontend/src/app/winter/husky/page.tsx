// app/husky/page.tsx
"use client";

import { motion } from "framer-motion";

export default function HuskyPage() {
  return (
    <main className="w-full min-h-screen bg-blue-50 text-gray-800">
      {/* Отступ сверху */}
      <div className="h-12" />

      {/* Hero */}
      <section
        className="relative h-[75vh] flex items-center justify-center bg-cover bg-center rounded-b-3xl overflow-hidden shadow-xl"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1549887534-3db1bd59dcca?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Катание на хаски
          </h1>
          <p className="mt-4 text-xl text-white/90 drop-shadow">
            Незабываемое зимнее приключение в компании дружелюбных собак
          </p>
        </motion.div>
      </section>

      {/* Описание */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6 text-blue-900">
          Зимняя сказка с хаски
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          Катание на упряжке с хаски — это невероятное приключение, которое
          дарит радость детям и взрослым.  
          Дружелюбные собаки с восторгом везут сани по живописным заснеженным
          тропам, а в конце маршрута вас ждут объятия пушистых друзей и
          фотосессия.  
        </p>
      </section>

      {/* Галерея */}
      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        {[
          "https://images.unsplash.com/photo-1554692918-08fa0fdc9d6d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1615810641331-42ec29c07c41?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1603570812134-8d5aafeb91a1?auto=format&fit=crop&w=800&q=80",
        ].map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden shadow-lg bg-white"
          >
            <img
              src={src}
              alt={`Хаски ${i + 1}`}
              className="w-full h-64 object-cover"
            />
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Хотите прокатиться?</h2>
        <p className="mb-6 text-lg">
          Забронируйте катание на хаски и получите море эмоций!
        </p>
        <a href="/booking">
          <button className="bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold shadow-lg">
            Забронировать
          </button>
        </a>
      </section>
    </main>
  );
}
