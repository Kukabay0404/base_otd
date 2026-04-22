"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiUrl } from "@/lib/api";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const cabinId = searchParams.get("cabinId"); // если пришёл с /lodge
  const roomId = searchParams.get("roomId");
  const roomTitle = searchParams.get("roomTitle") || searchParams.get("cabinTitle");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests");
  const price = searchParams.get("price");

  // Парсим гостей
  const parsedGuests = guests ? JSON.parse(guests) : [];
  const totalAdults = parsedGuests.reduce(
    (sum: number, r: any) => sum + (r.adults || 0),
    0
  );
  const totalChildren = parsedGuests.reduce(
    (sum: number, r: any) => sum + (r.children || 0),
    0
  );
  const totalRooms = parsedGuests.length;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    email: "",
    citizenship: "RU",
    agreement: true,
    comments: "",
    payment: "card",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [target.name]: target.value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bookingData = {
      object_type: roomId ? "room" : "cabin", // ✅ корректное определение
      object_id: roomId ? Number(roomId) : Number(cabinId),
      last_name: formData.lastName,
      first_name: formData.firstName,
      middle_name: formData.middleName || null,
      phone: formData.phone,
      email: formData.email,
      citizenship: formData.citizenship,
      comments: formData.comments || null,
      payment: formData.payment,
      start_date: checkIn ? new Date(checkIn).toISOString() : null,
      end_date: checkOut ? new Date(checkOut).toISOString() : null,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Для бронирования нужно войти в аккаунт");
        router.push("/auth/login");
        return;
      }
      const headers: HeadersInit = { "Content-Type": "application/json" };
      headers.Authorization = `Bearer ${token}`;

      const res = await fetch(apiUrl("/checkout/"), {
        method: "POST",
        headers,
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        throw new Error("Ошибка при бронировании");
      }

      const result = await res.json();
      console.log("✅ Бронирование успешно:", result);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Ошибка при бронировании");
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Бронирование</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Левая часть — форма */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white shadow-lg rounded-2xl p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold">Введите свои данные</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="lastName"
              placeholder="Фамилия"
              value={formData.lastName}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <input
              type="text"
              name="firstName"
              placeholder="Имя"
              value={formData.firstName}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
          </div>

          <input
            type="text"
            name="middleName"
            placeholder="Отчество"
            value={formData.middleName}
            onChange={handleChange}
            className="border rounded-lg p-2 w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              name="phone"
              placeholder="Номер телефона"
              value={formData.phone}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Электронная почта"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-lg p-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700">Гражданство</label>
            <select
              name="citizenship"
              value={formData.citizenship}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            >
              <option value="RU">Россия</option>
              <option value="KZ">Казахстан</option>
              <option value="UA">Украина</option>
              <option value="BY">Беларусь</option>
            </select>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Дополнительно</h2>
            <textarea
              name="comments"
              placeholder="Вы можете оставить дополнительный комментарий при желании"
              value={formData.comments}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
              rows={3}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Выберите способ оплаты</h2>
            <label className="flex items-center border p-4 rounded-lg mb-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={formData.payment === "card"}
                onChange={handleChange}
                className="mr-3"
              />
              <div>
                <p className="font-semibold">Гарантия банковской картой</p>
                <p className="text-sm text-gray-600">
                  Оплачивается вся сумма брони. Сумма будет списана до заезда.
                </p>
              </div>
            </label>
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleChange}
              required
            />
            <span className="text-sm text-gray-600">
              Я даю согласие на обработку персональных данных
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Забронировать
          </button>
        </form>

        {/* Правая часть — детали брони */}
        <div className="bg-gray-50 border rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ваше бронирование</h2>

          <p className="text-gray-700 mb-2">
            <strong>Заезд:</strong>{" "}
            {checkIn ? new Date(checkIn).toLocaleDateString("ru-RU") : "—"}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Выезд:</strong>{" "}
            {checkOut ? new Date(checkOut).toLocaleDateString("ru-RU") : "—"}
          </p>

          <p className="text-gray-700 mb-2">
            <strong>Гости:</strong>{" "}
            {totalAdults} взрослых
            {totalChildren > 0 ? `, ${totalChildren} детей` : ""} (
            {totalRooms} номер{totalRooms > 1 ? "а" : ""})
          </p>

          <hr className="my-4" />

          <p className="text-gray-700 mb-2">
            <strong>Название номера:</strong> {roomTitle || "Не выбран"}
          </p>

          <p className="text-2xl font-bold text-green-700 mt-4">
            {price && !isNaN(Number(price))
              ? `${Number(price).toLocaleString("ru-RU")} ₸`
              : "Цена не указана"}
          </p>
        </div>
      </div>
    </div>
  );
}
