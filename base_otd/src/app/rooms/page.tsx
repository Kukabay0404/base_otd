"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Room {
  id: number;
  title: string;
  category: string;
  rooms: number;
  area: string;
  beds: number;
  tv: boolean;
  priceWeekdays: string;
  priceWeekend: string;
  images: string[];
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/room_admin")
      .then((res) => res.json())
      .then((data) => setRooms(data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-16">
      <div className="flex justify-center gap-6 mb-8">
        <Link href="/rooms">
          <button className="px-6 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 shadow">
            Номера
          </button>
        </Link>
        <Link href="/cabins">
          <button className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 shadow">
            Срубы
          </button>
        </Link>
      </div>

      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}

// функция нормализации пути
  function normalizeImagePath(path: string): string {
    if (!path) return "/placeholder.jpg";

    // внешняя ссылка
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // windows-путь (A:\... или C:\...)
    if (path.includes("\\") || path.includes(":")) {
      const fileName = path.split("\\").pop(); // lux1.jpg
      return `/rooms/${fileName}`;
    }

    // относительный путь (например "201/lux1.jpg")
    if (!path.startsWith("/")) {
      return `/rooms/${path}`;
    }

    // если уже нормальный путь "/rooms/xxx.jpg"
    return path;
  }


function RoomCard({ room }: { room: Room }) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
        </div>
        <div className="flex gap-3 mt-4">
          {room.images?.map((img, index) => (
            <div
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`relative w-20 h-16 cursor-pointer rounded overflow-hidden border ${
                index === currentImage ? "border-green-600" : "border-transparent"
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
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">{room.title}</h2>
        <p>
          <span className="font-semibold">Категория аппартамента:</span>{" "}
          {room.category}
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
          {room.tv ? "да" : "нет"}
        </p>
        <div className="mt-4 space-y-1">
          <p>
            Будни: <span className="font-semibold">{room.priceWeekdays}</span>
          </p>
          <p>
            Выходные: <span className="font-semibold">{room.priceWeekend}</span>
          </p>
        </div>
        <Link href="/checkout">
          <button className="mt-6 bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg">
            Забронировать
          </button>
        </Link>
      </div>
    </div>
  );
}
