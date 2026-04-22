"use client";

import { motion } from "framer-motion";
import { resolveMediaUrl } from "@/lib/media";

const skatingImages = {
  hero: "katok/funny-klev-club-p-smeshnie-kartinki-katanie-na-konkakh-31.jpg",
  gallery: [
    "katok/89d7b5042766a8c1cfca03e68929ab52.jpg",
    "katok/9a209be2a15d4e528e4bacb48d31.jpg",
    "katok/bcd8e9c6de5e4f055199884693ccf44f.jpg",
  ],
};

export default function SkatingPage() {
  return (
    <main className="w-full min-h-screen bg-gray-50 text-gray-800">
      <div className="h-12" />

      <section
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center rounded-b-3xl overflow-hidden shadow-md"
        style={{ backgroundImage: `url('${resolveMediaUrl(skatingImages.hero)}')` }}
      >
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
            Катание на коньках
          </h1>
          <p className="mt-4 text-xl text-white/90 drop-shadow">
            Зимняя магия на льду для всей семьи
          </p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Лед, музыка и веселье</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Наш каток под открытым небом это идеальное место для зимних развлечений.
          Вас ждет ухоженный лед, теплое освещение, музыка и горячие напитки в уютном кафе.
          Коньки можно взять напрокат на месте, а для новичков предусмотрены инструкторы.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-3 gap-6">
        {skatingImages.gallery.map((src, i) => (
          <motion.div
            key={src}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl overflow-hidden shadow-lg bg-white"
          >
            <img src={resolveMediaUrl(src)} alt={`Каток ${i + 1}`} className="w-full h-64 object-cover" />
          </motion.div>
        ))}
      </section>

      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Погрузитесь в атмосферу зимней сказки</h2>
        <p className="mb-6 text-lg">Забронируйте катание на коньках прямо сейчас!</p>
        <a href="/booking">
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold shadow-lg">
            Забронировать место
          </button>
        </a>
      </section>
    </main>
  );
}
