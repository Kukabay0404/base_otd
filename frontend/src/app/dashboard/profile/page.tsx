"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("Иван Иванов");
  const [phone, setPhone] = useState("+7 (900) 123-45-67");
  const [email, setEmail] = useState("ivan@example.com");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Изменения сохранены ✅");
    // Здесь потом будет запрос к API
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Редактировать профиль</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium mb-1">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Телефон */}
          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-between items-center pt-4">
            <Link href="/dashboard">
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg text-white"
              >
                Назад
              </button>
            </Link>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
