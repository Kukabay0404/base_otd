"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizeImagePath } from "@/lib/utils";

export interface Room {
  id: number;
  title: string;
  category: string;
  rooms: number;
  area: string;
  beds: number;
  tv: boolean;
  priceWeekdays: number;
  priceWeekend: number;
  images: string[];
}

export interface GuestInfo {
  adults: number;
  children: number;
}


export default function RoomCard({
  room,
  startDate,
  endDate,
  guests,
}: {
  room: Room;
  startDate?: Date;
  endDate?: Date;
  guests: GuestInfo[];
}) {
  const [currentImage, setCurrentImage] = useState(0);
  const router = useRouter();

  const startISO = startDate ? startDate.toISOString() : "";
  const endISO = endDate ? endDate.toISOString() : "";

  // Формируем строку запроса для брони (только при клике, чтобы избежать SSR/CSR mismatch)
  const buildBookingUrl = () => {
    const guestsQuery = encodeURIComponent(JSON.stringify(guests));
    return `/checkout?roomId=${room.id}&roomTitle=${encodeURIComponent(
      room.title
    )}&checkIn=${encodeURIComponent(startISO)}&checkOut=${encodeURIComponent(
      endISO
    )}&guests=${guestsQuery}&price=${room.priceWeekdays}`;
  };

  const onBookingClick = (e: React.MouseEvent) => {
    // Prevent default Link navigation — we'll perform client-side navigation with router.push
    e.preventDefault();
    const url = buildBookingUrl();
    router.push(url);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white rounded-2xl shadow-md p-6">
      {/* Галерея */}
      <div>
        <div className="relative w-full h-80 rounded-lg overflow-hidden">
          <Image
            src={
              room.images && room.images.length > 0
                ? normalizeImagePath(room.images[currentImage])
                : "/placeholder.jpg"
            }
            alt={room.title}
            fill
            className="object-cover"
          />
          {/* Навигация */}
          {room.images && room.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === 0 ? room.images.length - 1 : prev - 1
                  )
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded p-2 shadow"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentImage((prev) =>
                    prev === room.images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded p-2 shadow"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Миниатюры */}
        {room.images && room.images.length > 1 && (
          <div className="flex gap-3 mt-4">
            {room.images.map((img, index) => (
              <div
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`relative w-20 h-16 cursor-pointer rounded overflow-hidden border ${
                  index === currentImage
                    ? "border-green-600"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={normalizeImagePath(img)}
                  alt={`thumb-${index}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Инфо */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">{room.title}</h2>
        <p>
          <span className="font-semibold">Категория:</span> {room.category}
        </p>
        <p>
          <span className="font-semibold">Комнат:</span> {room.rooms}
        </p>
        <p>
          <span className="font-semibold">Квадратура:</span> {room.area}
        </p>
        <p>
          <span className="font-semibold">Спальных мест:</span> {room.beds}
        </p>
        <p>
          <span className="font-semibold">Телевизор:</span>{" "}
          {room.tv ? "Да" : "Нет"}
        </p>
        <div className="mt-4 space-y-1">
          <p>
            Будни: <span className="font-semibold">{room.priceWeekdays.toLocaleString()} ₸</span>
          </p>
          <p>
            Выходные: <span className="font-semibold">{room.priceWeekend.toLocaleString()} ₸</span>
          </p>
        </div>

        <Link href={`/checkout?roomId=${room.id}`} onClick={onBookingClick}>
          <button className="mt-4 bg-green-700 hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold">
            Забронировать
          </button>
        </Link>
      </div>
    </div>
  );
}
