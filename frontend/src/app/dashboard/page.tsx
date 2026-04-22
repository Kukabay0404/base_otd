"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

interface UserMe {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "client";
  created_at: string;
}

interface MyBooking {
  id: number;
  object_type: "room" | "cabin";
  object_id: number;
  object_title: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  status: "pending" | "confirmed" | "cancelled";
}

function formatDate(value: string | null): string {
  if (!value) return "Не указана";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Не указана";
  return d.toLocaleDateString("ru-RU");
}

function statusLabel(status: MyBooking["status"]): string {
  if (status === "confirmed") return "Подтверждена";
  if (status === "cancelled") return "Отменена";
  return "Ожидает";
}

function statusClass(status: MyBooking["status"]): string {
  if (status === "confirmed") return "bg-green-100 text-green-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const load = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, bookingsRes] = await Promise.all([
          fetch(apiUrl("/auth/me"), { headers }),
          fetch(apiUrl("/checkout/my"), { headers }),
        ]);

        if (userRes.status === 401 || bookingsRes.status === 401) {
          localStorage.removeItem("token");
          router.replace("/auth/login");
          return;
        }

        if (!userRes.ok || !bookingsRes.ok) {
          throw new Error("Не удалось загрузить данные личного кабинета");
        }

        const userData = (await userRes.json()) as UserMe;
        const bookingsData = (await bookingsRes.json()) as MyBooking[];

        setUser(userData);
        setBookings(bookingsData);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Ошибка загрузки данных";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 py-10 px-6">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Личный кабинет</h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Мои заявки и брони</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600">У вас пока нет бронирований.</p>
          ) : (
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">
                      {booking.object_type === "room" ? "Номер" : "Сруб"}
                      {": "}
                      {booking.object_title ?? `#${booking.object_id}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm ${statusClass(booking.status)}`}>
                    {statusLabel(booking.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Профиль</h2>
          <div className="p-4 border rounded-lg space-y-1">
            <p>
              <span className="font-medium">Имя:</span>{" "}
              {user ? `${user.first_name} ${user.last_name}` : "-"}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email ?? "-"}
            </p>
            <p>
              <span className="font-medium">Роль:</span> {user?.role ?? "-"}
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
          >
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}
