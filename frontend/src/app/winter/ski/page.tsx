"use client";

import { motion } from "framer-motion";
import { resolveMediaUrl } from "@/lib/media";

const skiImages = {
  hero: "ski/2fa665d25981418e92d24f6cf05bd8ac.jpg",
  gallery: [
    "ski/11c2008b96c53aaf2e8a0d09bc1de4bb.jpg",
    "ski/3692b1b0b33f024b58677e1d365ff851.jpg",
    "ski/9edaed9ed2d6774722b522e0e6ca009e.jpg",
  ],
};

export default function SkiingPage() {
  return (
    <main className="w-full min-h-screen bg-white text-gray-800">
      <div className="h-12" />

      <section
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url('${resolveMediaUrl(skiImages.hero)}')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white text-5xl md:text-6xl font-bold text-center"
        >
          Катание на лыжах
        </motion.h1>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-6">Зимние развлечения</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-6">
          Наша база отдыха предлагает отличные условия для любителей лыжного спорта.
          Живописные лесные трассы, ухоженные склоны и современное оборудование создают
          идеальные условия для активного зимнего отдыха всей семьей.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-12 grid md:grid-cols-3 gap-6">
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img src={resolveMediaUrl(skiImages.gallery[0])} alt="Лыжная трасса" className="w-full h-64 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img src={resolveMediaUrl(skiImages.gallery[1])} alt="Катание на лыжах" className="w-full h-64 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img src={resolveMediaUrl(skiImages.gallery[2])} alt="Семейный отдых" className="w-full h-64 object-cover" />
        </div>
      </section>

      <section className="bg-green-600 text-white text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Забронируйте отдых на лыжах</h2>
        <p className="mb-6 text-lg">Выберите удобные даты и насладитесь зимними приключениями</p>
        <a href="/booking">
          <button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold shadow-lg">
            Забронировать сейчас
          </button>
        </a>
      </section>
    </main>
  );
}
