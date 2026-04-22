"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-date-range";
import type { Range, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Plus, Minus } from "lucide-react";
import RoomCard, { Room } from "@/components/RoomCard";
import { apiUrl } from "@/lib/api";

export default function BookingClient({ initialRooms, initialFetchError }: { initialRooms?: Room[]; initialFetchError?: boolean }) {
  const [roomsData, setRoomsData] = useState<Room[]>(initialRooms ?? []);
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // гости
  const [roomsGuests, setRoomsGuests] = useState([{ adults: 2, children: 0 }]);
  const [showGuests, setShowGuests] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // даты
  const [dateRange, setDateRange] = useState<Range[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [prefilledFromQuery, setPrefilledFromQuery] = useState(false);
  const autoSearchDoneRef = useRef(false);
  useEffect(() => {
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");
    const guestsParam = searchParams.get("guests");

    const now = new Date();
    const start = checkInParam ? new Date(checkInParam) : now;
    const end = checkOutParam ? new Date(checkOutParam) : start;

    const safeStart = Number.isNaN(start.getTime()) ? now : start;
    const safeEndCandidate = Number.isNaN(end.getTime()) ? safeStart : end;
    const safeEnd = safeEndCandidate < safeStart ? safeStart : safeEndCandidate;

    setDateRange([
      {
        startDate: safeStart,
        endDate: safeEnd,
        key: "selection",
      },
    ]);

    if (guestsParam) {
      try {
        const parsed = JSON.parse(guestsParam) as Array<{ adults?: number; children?: number }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((g) => ({
            adults: Math.max(1, Number(g.adults) || 1),
            children: Math.max(0, Number(g.children) || 0),
          }));
          setRoomsGuests(normalized);
        }
      } catch {
        // ignore malformed guests query
      }
    }

    setPrefilledFromQuery(Boolean(checkInParam || checkOutParam || guestsParam));
    setMounted(true);
  }, [searchParams]);

  // закрытие выпадашек
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) {
        setShowGuests(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // функции гостей — мемоизируем обработчики и вычисления, чтобы уменьшить лишние рендеры
  const updateRoomGuests = useCallback((index: number, field: "adults" | "children", value: number) => {
    setRoomsGuests((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: Math.max(0, value) } : r))
    );
  }, []);

  const addRoom = useCallback(() => {
    setRoomsGuests((prev) => [...prev, { adults: 1, children: 0 }]);
  }, []);

  const totalAdults = useMemo(() => roomsGuests.reduce((sum, r) => sum + r.adults, 0), [roomsGuests]);
  const totalChildren = useMemo(() => roomsGuests.reduce((sum, r) => sum + r.children, 0), [roomsGuests]);

  const handleSearch = useCallback(async () => {
    setSearchPerformed(true);
    if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) {
      setError("Пожалуйста, выберите даты");
      return;
    }

    const payload = {
      startDate: dateRange[0].startDate.toISOString(),
      endDate: dateRange[0].endDate.toISOString(),
      guests: roomsGuests,
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/room_admin/public/search"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        setError('Ошибка поиска');
        return;
      }

      const data = await res.json();

      // нормализация данных
      const normalized = data.map((room: any) => ({
        id: room.id,
        title: room.title,
        category: room.category,
        rooms: room.rooms,
        area: room.area,
        beds: room.beds,
        tv: room.tv,
        priceWeekdays: Number(room.priceWeekdays) || 0,
        priceWeekend: Number(room.priceWeekend) || 0,
        images: room.images ?? [],
      }));

      setRoomsData(normalized);

    } catch (err) {
      console.error(err);
      setError('Не удалось выполнить поиск номеров');
    } finally {
      setLoading(false);
    }
  }, [dateRange, roomsGuests]);

  useEffect(() => {
    if (!mounted || !prefilledFromQuery || autoSearchDoneRef.current) return;

    const start = dateRange[0]?.startDate;
    const end = dateRange[0]?.endDate;
    if (!start || !end || end <= start) return;

    autoSearchDoneRef.current = true;
    void handleSearch();
  }, [mounted, prefilledFromQuery, dateRange, handleSearch]);

  const guestsQuery = useMemo(() => roomsGuests.map((r, i) => `room${i + 1}=${r.adults}+${r.children}`).join("&"), [roomsGuests]);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 space-y-12">

        {/* Заголовок */}
          <h1 className="text-4xl font-bold">Бронирование</h1>
          {initialFetchError && (
            <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mt-2">Не удалось загрузить начальные данные — попробуйте выполнить поиск вручную.</div>
          )}
        <p className="text-gray-600">
          С помощью формы ниже вы можете забронировать наши номера в режиме онлайн и получить гарантированную бронь.
        </p>

        {/* форма дат и гостей */}
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col md:flex-row gap-4 items-start">
          {error && (
            <div className="w-full mb-2 text-sm text-red-600 font-medium">{error}</div>
          )}
          {/* календарь */}
          <div className="relative" ref={calendarRef}>
            <div
              onClick={() => setShowCalendar((prev) => !prev)}
              className="border rounded-lg p-3 w-64 cursor-pointer bg-white"
              role="button"
              aria-expanded={showCalendar}
            >
              {dateRange[0]?.startDate?.toLocaleDateString("ru-RU")} —{" "}
              {dateRange[0]?.endDate?.toLocaleDateString("ru-RU")}
            </div>
            {showCalendar && mounted && (
              <div className="absolute z-50 mt-2">
                <DateRange
                  ranges={dateRange}
                  onChange={(ranges: RangeKeyDict) => {
                    setDateRange([ranges.selection]);
                  }}
                  moveRangeOnFirstSelection={false}
                  rangeColors={["#0d9488"]}
                  editableDateInputs={true}
                />
              </div>
            )}
          </div>

          {/* гости */}
          <div className="relative w-full md:w-auto" ref={guestsRef}>
            <div
              onClick={() => setShowGuests(!showGuests)}
              className="border rounded-lg p-3 cursor-pointer bg-white w-64"
              role="button"
              aria-expanded={showGuests}
            >
              Гости: {totalAdults} взрослых
              {totalChildren > 0 && `, ${totalChildren} детей`} (
              {roomsGuests.length} номер{roomsGuests.length > 1 ? "а" : ""})
            </div>

            {showGuests && (
              <div className="absolute z-50 mt-2 bg-white shadow-lg rounded-xl p-4 w-[24rem] max-w-[calc(100vw-2rem)]">
                {roomsGuests.map((room, index) => (
                  <div key={index} className="mb-4 border-b pb-3">
                    <h3 className="font-semibold mb-2">Номер {index + 1}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span>Взрослые</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoomGuests(index, "adults", roomsGuests[index].adults - 1)}
                          className="p-1 border rounded"
                        >
                          <Minus size={16} />
                        </button>
                        <span>{roomsGuests[index].adults}</span>
                        <button
                          type="button"
                          onClick={() => updateRoomGuests(index, "adults", roomsGuests[index].adults + 1)}
                          className="p-1 border rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Дети младше 18 лет</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateRoomGuests(index, "children", roomsGuests[index].children - 1)}
                          className="p-1 border rounded"
                        >
                          <Minus size={16} />
                        </button>
                        <span>{roomsGuests[index].children}</span>
                        <button
                          type="button"
                          onClick={() => updateRoomGuests(index, "children", roomsGuests[index].children + 1)}
                          className="p-1 border rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addRoom} className="text-teal-600 font-semibold mb-3">
                  + Добавить номер
                </button>

                <button
                  type="button"
                  onClick={() => setShowGuests(false)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2 rounded-lg w-full"
                >
                  Готово
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-2 rounded-lg text-white font-semibold shadow ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'}`}
            >
              {loading ? 'Поиск...' : 'Найти'}
            </button>
            {loading && <div className="text-sm text-gray-600">Загрузка...</div>}
          </div>
        </div>

        {/* кнопки переключения */}
        <div className="flex justify-center gap-6 mb-8">
          <Link href="/booking">
            <button className="px-6 py-2 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 shadow">
              Номера
            </button>
          </Link>
          <Link href="/lodge">
            <button className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 shadow">
              Срубы
            </button>
          </Link>
        </div>

        {roomsData.length > 0 && (
          <p className="text-lg text-gray-700">
            Найдено свободных номеров: {" "}
            <span className="font-semibold text-green-700">{roomsData.length}</span>
          </p>
        )}
        {roomsData.length === 0 && searchPerformed && (
          <p className="text-lg text-red-600">Нет доступных номеров на выбранные даты</p>
        )}

        {/* карточки с передачей данных */}
        <div className="space-y-12">
          {roomsData.map((room: Room) => (
            <RoomCard
              key={room.id}
              room={room}
              startDate={mounted ? dateRange[0]?.startDate || new Date() : new Date()}
              endDate={mounted ? dateRange[0]?.endDate || new Date() : new Date()}
              guests={roomsGuests}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
