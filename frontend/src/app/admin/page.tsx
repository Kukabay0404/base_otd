// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Input from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const TARGET_IMAGE_MIME = "image/webp";
const TARGET_IMAGE_QUALITY = 0.82;

type UploadTarget = "newRoom" | "editRoom" | "newCabin" | "editCabin";

interface PresignUploadResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
  requiredHeaders?: Record<string, string>;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface UserCreate {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  password: string;
}

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

interface Cabin {
  id: number;
  title: string;
  description: string;
  rooms: number;
  floors: number;
  beds: number;
  category: string;
  priceWeekdays: string;
  priceWeekend: string;
  pool: boolean;
  images: string[];
}

interface Booking {
  id: number;
  object_type: "room" | "cabin";
  object_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSavingId, setStatusSavingId] = useState<number | null>(null);
  const apiBase = API_BASE_URL;

  // формы создания
  const [newUser, setNewUser] = useState<Partial<UserCreate>>({});
  const [newRoom, setNewRoom] = useState<Partial<Room>>({});
  const [newCabin, setNewCabin] = useState<Partial<Cabin>>({});

  // редактируемые объекты
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingCabin, setEditingCabin] = useState<Cabin | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<UploadTarget | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const authHeaders = (withJson = false): HeadersInit => {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    if (withJson) {
      return { ...headers, "Content-Type": "application/json" };
    }
    return headers;
  };

  const parseImageUrls = (value: string): string[] =>
    value
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Допустимы только файлы JPG, PNG или WEBP.";
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return "Файл слишком большой. Максимум 10 MB.";
    }
    return null;
  };

  const optimizeImageForUpload = async (file: File): Promise<File> => {
    // Small files usually don't benefit enough to justify processing on client.
    if (file.size <= 1_500_000) return file;

    const readDataUrl = (source: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
        reader.readAsDataURL(source);
      });

    const loadImage = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Не удалось декодировать изображение"));
        img.src = src;
      });

    const dataUrl = await readDataUrl(file);
    const img = await loadImage(dataUrl);

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Не удалось обработать изображение");

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, TARGET_IMAGE_MIME, TARGET_IMAGE_QUALITY);
    });

    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const optimized = new File([blob], `${baseName}.webp`, { type: TARGET_IMAGE_MIME });
    return optimized.size < file.size ? optimized : file;
  };

  const uploadImageToR2 = async (
    file: File,
    folder: "rooms" | "cabins",
  ): Promise<PresignUploadResponse> => {
    const presignRes = await fetch(`${apiBase}/media/presign-upload`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        folder,
      }),
    });

    if (!presignRes.ok) {
      let message = "Не удалось получить ссылку для загрузки";
      try {
        const body = await presignRes.json();
        if (typeof body?.detail === "string") {
          message = body.detail;
        }
      } catch {
        // ignore invalid json error
      }
      throw new Error(message);
    }

    const presignData = (await presignRes.json()) as PresignUploadResponse;
    const uploadRes = await fetch(presignData.uploadUrl, {
      method: "PUT",
      headers: presignData.requiredHeaders ?? { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Не удалось загрузить файл в хранилище");
    }
    return presignData;
  };

  const handleImageUpload = async (
    file: File | null,
    folder: "rooms" | "cabins",
    target: UploadTarget,
  ) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError(null);
    setUploadingTarget(target);

    try {
      const optimizedFile = await optimizeImageForUpload(file);
      const uploaded = await uploadImageToR2(optimizedFile, folder);

      if (target === "newRoom") {
        setNewRoom((prev) => ({
          ...prev,
          images: [...(prev.images ?? []), uploaded.fileKey],
        }));
      } else if (target === "editRoom") {
        setEditingRoom((prev) =>
          prev
            ? { ...prev, images: [...(prev.images ?? []), uploaded.fileKey] }
            : prev,
        );
      } else if (target === "newCabin") {
        setNewCabin((prev) => ({
          ...prev,
          images: [...(prev.images ?? []), uploaded.fileKey],
        }));
      } else {
        setEditingCabin((prev) =>
          prev
            ? { ...prev, images: [...(prev.images ?? []), uploaded.fileKey] }
            : prev,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setUploadError(message);
    } finally {
      setUploadingTarget(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/auth/login");
          return;
        }

        const meRes = await fetch(`${apiBase}/auth/me`, {
          headers: authHeaders(),
        });
        if (!meRes.ok) {
          localStorage.removeItem("token");
          router.replace("/auth/login");
          return;
        }

        const me = await meRes.json();
        if (me.role !== "admin") {
          router.replace("/");
          return;
        }

        const [usersRes, roomsRes, cabinsRes, bookingsRes] = await Promise.all([
          fetch(`${apiBase}/user_admin/`, { headers: authHeaders() }),
          fetch(`${apiBase}/room_admin/`, { headers: authHeaders() }),
          fetch(`${apiBase}/cabin_admin/`, { headers: authHeaders() }),
          fetch(`${apiBase}/checkout/`, { headers: authHeaders() }),
        ]);

        if ([usersRes, roomsRes, cabinsRes, bookingsRes].some((r) => !r.ok)) {
          throw new Error("Failed to fetch admin data");
        }

        const usersData = await usersRes.json();
        const roomsData = await roomsRes.json();
        const cabinsData = await cabinsRes.json();
        const bookingsData = await bookingsRes.json();

        setUsers(Array.isArray(usersData) ? usersData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setCabins(Array.isArray(cabinsData) ? cabinsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error(err);
        setError("Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // ---------------- CRUD USERS ----------------
  const deleteUser = async (id: number) => {
    if (!confirm("Удалить пользователя?")) return;
    try {
      const res = await fetch(`${apiBase}/user_admin/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Ошибка удаления пользователя");
    }
  };

  const createUser = async () => {
    try {
      const res = await fetch(`${apiBase}/auth/register/`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
        setNewUser({});
      }
    } catch {
      alert("Ошибка создания пользователя");
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`${apiBase}/auth/${editingUser.id}/`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(editingUser),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setEditingUser(null);
      }
    } catch {
      alert("Ошибка обновления пользователя");
    }
  };
  // ---------------- CRUD ROOMS ----------------
  const deleteRoom = async (id: number) => {
    if (!confirm("Удалить номер?")) return;
    try {
      const res = await fetch(`${apiBase}/room_admin/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Ошибка удаления номера");
    }
  };

  const createRoom = async () => {
    try {
      const res = await fetch(`${apiBase}/room_admin/`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(newRoom),
      });
      if (res.ok) {
        const created = await res.json();
        setRooms((prev) => [...prev, created]);
        setNewRoom({});
      }
    } catch {
      alert("Ошибка создания номера");
    }
  };

  const updateRoom = async () => {
    if (!editingRoom) return;
    try {
      const res = await fetch(`${apiBase}/room_admin/${editingRoom.id}/`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(editingRoom),
      });
      if (res.ok) {
        const updated = await res.json();
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        setEditingRoom(null);
      }
    } catch {
      alert("Ошибка обновления номера");
    }
  };

  // ---------------- CRUD CABINS ----------------
  const deleteCabin = async (id: number) => {
    if (!confirm("Удалить сруб?")) return;
    try {
      const res = await fetch(`${apiBase}/cabin_admin/${id}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) setCabins((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Ошибка удаления сруба");
    }
  };

  const createCabin = async () => {
    try {
      const res = await fetch(`${apiBase}/cabin_admin/`, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(newCabin),
      });
      if (res.ok) {
        const created = await res.json();
        setCabins((prev) => [...prev, created]);
        setNewCabin({});
      }
    } catch {
      alert("Ошибка создания сруба");
    }
  };

  const updateCabin = async () => {
    if (!editingCabin) return;
    try {
      const res = await fetch(`${apiBase}/cabin_admin/${editingCabin.id}/`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify(editingCabin),
      });
      if (res.ok) {
        const updated = await res.json();
        setCabins((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        setEditingCabin(null);
      }
    } catch {
      alert("Ошибка обновления сруба");
    }
  };

  const updateBookingStatus = async (
    bookingId: number,
    nextStatus: Booking["status"],
  ) => {
    setStatusSavingId(bookingId);
    try {
      const res = await fetch(`${apiBase}/checkout/admin/${bookingId}/status`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("Не удалось обновить статус");
      }

      const updated = (await res.json()) as Booking;
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: updated.status } : b)),
      );
    } catch {
      alert("Ошибка обновления статуса заявки");
    } finally {
      setStatusSavingId(null);
    }
  };
  if (loading) return <div className="p-6 text-center">Загрузка...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6">
      <h1 className="mb-6 text-center text-2xl font-bold md:mb-8 md:text-3xl">Админ-панель</h1>
      {uploadError && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-1 flex w-full gap-2 overflow-x-auto pb-1">
          <TabsTrigger value="users" className="whitespace-nowrap">Пользователи</TabsTrigger>
          <TabsTrigger value="rooms" className="whitespace-nowrap">Номера</TabsTrigger>
          <TabsTrigger value="cabins" className="whitespace-nowrap">Срубы</TabsTrigger>
          <TabsTrigger value="bookings" className="whitespace-nowrap">Заявки</TabsTrigger>
          <TabsTrigger value="addUser" className="whitespace-nowrap">Создать пользователя</TabsTrigger>
          <TabsTrigger value="addRoom" className="whitespace-nowrap">Создать номер</TabsTrigger>
          <TabsTrigger value="addCabin" className="whitespace-nowrap">Создать сруб</TabsTrigger>
        </TabsList>

        {/* Пользователи */}
        <TabsContent value="users">
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Имя</th>
                <th className="border px-4 py-2">Фамилия</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Роль</th>
                <th className="border px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-4 py-2">{u.id}</td>
                  <td className="border px-4 py-2">{u.first_name}</td>
                  <td className="border px-4 py-2">{u.last_name}</td>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2">{u.role}</td>
                  <td className="flex flex-col gap-2 border px-4 py-2 sm:flex-row">
                    <Button
                      onClick={() => deleteUser(u.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Удалить
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setEditingUser({ ...u })}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Редактировать
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактирование пользователя</DialogTitle>
                        </DialogHeader>
                        {editingUser && (
                          <div className="space-y-3 mt-3">
                            <Input
                              value={editingUser.first_name}
                              onChange={(e) =>
                                setEditingUser({ ...editingUser, first_name: e.target.value })
                              }
                            />
                            <Input
                              value={editingUser.last_name}
                              onChange={(e) =>
                                setEditingUser({ ...editingUser, last_name: e.target.value })
                              }
                            />
                            <Input
                              value={editingUser.email}
                              onChange={(e) =>
                                setEditingUser({ ...editingUser, email: e.target.value })
                              }
                            />
                            <Button onClick={updateUser} className="bg-green-600 text-white">
                              Сохранить
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </TabsContent>

        {/* Номера */}
        <TabsContent value="rooms">
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Название</th>
                <th className="border px-4 py-2">Категория</th>
                <th className="border px-4 py-2">Комнат</th>
                <th className="border px-4 py-2">Площадь</th>
                <th className="border px-4 py-2">Спальных мест</th>
                <th className="border px-4 py-2">Телевизор</th>
                <th className="border px-4 py-2">Цена будни</th>
                <th className="border px-4 py-2">Цена выходные</th>
                <th className="border px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td className="border px-4 py-2">{r.id}</td>
                  <td className="border px-4 py-2">{r.title}</td>
                  <td className="border px-4 py-2">{r.category}</td>
                  <td className="border px-4 py-2">{r.rooms}</td>
                  <td className="border px-4 py-2">{r.area}</td>
                  <td className="border px-4 py-2">{r.beds}</td>
                  <td className="border px-4 py-2">{r.tv ? "Да" : "Нет"}</td>
                  <td className="border px-4 py-2">{r.priceWeekdays}</td>
                  <td className="border px-4 py-2">{r.priceWeekend}</td>
                  <td className="flex flex-col gap-2 border px-4 py-2 sm:flex-row">
                    <Button
                      onClick={() => deleteRoom(r.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Удалить
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setEditingRoom({ ...r })}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Редактировать
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактирование номера</DialogTitle>
                        </DialogHeader>
                        {editingRoom && (
                          <div className="space-y-3 mt-3">
                            <Input
                              value={editingRoom.title}
                              onChange={(e) =>
                                setEditingRoom({ ...editingRoom, title: e.target.value })
                              }
                            />
                            <Input
                              value={editingRoom.category}
                              onChange={(e) =>
                                setEditingRoom({ ...editingRoom, category: e.target.value })
                              }
                            />
                            <Input
                              value={editingRoom.area}
                              onChange={(e) =>
                                setEditingRoom({ ...editingRoom, area: e.target.value })
                              }
                            />
                            <Input
                              value={editingRoom.priceWeekdays}
                              onChange={(e) =>
                                setEditingRoom({ ...editingRoom, priceWeekdays: e.target.value })
                              }
                            />
                            <Input
                              value={editingRoom.priceWeekend}
                              onChange={(e) =>
                                setEditingRoom({ ...editingRoom, priceWeekend: e.target.value })
                              }
                            />
                            <Input
                              placeholder="URL картинок (через запятую)"
                              value={editingRoom.images?.join(", ") || ""}
                              onChange={(e) =>
                                setEditingRoom({
                                  ...editingRoom,
                                  images: parseImageUrls(e.target.value),
                                })
                              }
                            />
                            <div className="space-y-2">
                              <Label htmlFor="edit-room-image-upload">Загрузить изображение (R2)</Label>
                              <Input
                                id="edit-room-image-upload"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleImageUpload(e.target.files?.[0] ?? null, "rooms", "editRoom")
                                }
                              />
                              {uploadingTarget === "editRoom" && (
                                <p className="text-sm text-gray-600">Загрузка файла...</p>
                              )}
                            </div>
                            <Button onClick={updateRoom} className="bg-green-600 text-white">
                              Сохранить
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </TabsContent>
                {/* Срубы */}
        <TabsContent value="cabins">
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Название</th>
                <th className="border px-4 py-2">Категория</th>
                <th className="border px-4 py-2">Комнат</th>
                <th className="border px-4 py-2">Этажей</th>
                <th className="border px-4 py-2">Спальных мест</th>
                <th className="border px-4 py-2">Бассейн</th>
                <th className="border px-4 py-2">Цена будни</th>
                <th className="border px-4 py-2">Цена выходные</th>
                <th className="border px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {cabins.map((c) => (
                <tr key={c.id}>
                  <td className="border px-4 py-2">{c.id}</td>
                  <td className="border px-4 py-2">{c.title}</td>
                  <td className="border px-4 py-2">{c.category}</td>
                  <td className="border px-4 py-2">{c.rooms}</td>
                  <td className="border px-4 py-2">{c.floors}</td>
                  <td className="border px-4 py-2">{c.beds}</td>
                  <td className="border px-4 py-2">{c.pool ? "Да" : "Нет"}</td>
                  <td className="border px-4 py-2">{c.priceWeekdays}</td>
                  <td className="border px-4 py-2">{c.priceWeekend}</td>
                  <td className="flex flex-col gap-2 border px-4 py-2 sm:flex-row">
                    <Button
                      onClick={() => deleteCabin(c.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Удалить
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setEditingCabin({ ...c })}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Редактировать
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Редактирование сруба</DialogTitle>
                        </DialogHeader>
                        {editingCabin && (
                          <div className="space-y-3 mt-3">
                            <Input
                              value={editingCabin.title}
                              onChange={(e) =>
                                setEditingCabin({ ...editingCabin, title: e.target.value })
                              }
                            />
                            <Input
                              value={editingCabin.category}
                              onChange={(e) =>
                                setEditingCabin({ ...editingCabin, category: e.target.value })
                              }
                            />
                            <Input
                              value={editingCabin.priceWeekdays}
                              onChange={(e) =>
                                setEditingCabin({
                                  ...editingCabin,
                                  priceWeekdays: e.target.value,
                                })
                              }
                            />
                            <Input
                              value={editingCabin.priceWeekend}
                              onChange={(e) =>
                                setEditingCabin({
                                  ...editingCabin,
                                  priceWeekend: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder="URL картинок (через запятую)"
                              value={editingCabin.images?.join(", ") || ""}
                              onChange={(e) =>
                                setEditingCabin({
                                  ...editingCabin,
                                  images: parseImageUrls(e.target.value),
                                })
                              }
                            />
                            <div className="space-y-2">
                              <Label htmlFor="edit-cabin-image-upload">Загрузить изображение (R2)</Label>
                              <Input
                                id="edit-cabin-image-upload"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  handleImageUpload(e.target.files?.[0] ?? null, "cabins", "editCabin")
                                }
                              />
                              {uploadingTarget === "editCabin" && (
                                <p className="text-sm text-gray-600">Загрузка файла...</p>
                              )}
                            </div>
                            <Button onClick={updateCabin} className="bg-green-600 text-white">
                              Сохранить
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <div className="mt-4 overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Тип</th>
                <th className="border px-4 py-2">Объект</th>
                <th className="border px-4 py-2">Клиент</th>
                <th className="border px-4 py-2">Период</th>
                <th className="border px-4 py-2">Статус</th>
                <th className="border px-4 py-2">Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="border px-4 py-2">{b.id}</td>
                  <td className="border px-4 py-2">
                    {b.object_type === "room" ? "Номер" : "Сруб"}
                  </td>
                  <td className="border px-4 py-2">#{b.object_id}</td>
                  <td className="border px-4 py-2">
                    {b.last_name} {b.first_name}
                    <div className="text-xs text-gray-500">{b.email}</div>
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(b.start_date).toLocaleDateString("ru-RU")} -{" "}
                    {new Date(b.end_date).toLocaleDateString("ru-RU")}
                  </td>
                  <td className="border px-4 py-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={b.status}
                      onChange={(e) => {
                        const status = e.target.value as Booking["status"];
                        setBookings((prev) =>
                          prev.map((row) =>
                            row.id === b.id ? { ...row, status } : row,
                          ),
                        );
                      }}
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <Button
                      onClick={() => updateBookingStatus(b.id, b.status)}
                      disabled={statusSavingId === b.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {statusSavingId === b.id ? "Сохраняю..." : "Сохранить"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </TabsContent>

        <TabsContent value="addUser">
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Имя"
              value={newUser.first_name || ""}
              onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, first_name: e.target.value })}
            />
            <Input
              placeholder="Фамилия"
              value={newUser.last_name || ""}
              onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, last_name: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={newUser.email || ""}
              onChange={(e : React.ChangeEvent<HTMLInputElement>) => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Input
              placeholder="Пароль"
              type="password"
              onChange={(e : React.ChangeEvent<HTMLInputElement>) =>
                setNewUser({ ...newUser, password: e.target.value as any })
              }
            />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Админ</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={newUser.role === "admin" ? "default" : "outline"}
                  className={newUser.role === "admin" ? "bg-green-600 text-white" : ""}
                  onClick={() => setNewUser({ ...newUser, role: "admin" })}
                >
                  Да
                </Button>
                <Button
                  type="button"
                  variant={newUser.role !== "admin" ? "default" : "outline"}
                  className={newUser.role !== "admin" ? "bg-red-600 text-white" : ""}
                  onClick={() => setNewUser({ ...newUser, role: "client" })}
                >
                  Нет
                </Button>
              </div>
            </div>
            <Button onClick={createUser} className="bg-green-700 text-white">
              Создать пользователя
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="addRoom">
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Название"
            value={newRoom.title || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, title: e.target.value })
            }
          />
          <Input
            placeholder="Категория"
            value={newRoom.category || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, category: e.target.value })
            }
          />
          <Input
            placeholder="Комнат"
            type="number"
            value={newRoom.rooms || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, rooms: +e.target.value })
            }
          />
          <Input
            placeholder="Площадь"
            value={newRoom.area || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, area: e.target.value })
            }
          />
          <Input
            placeholder="Спальных мест"
            type="number"
            value={newRoom.beds || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, beds: +e.target.value })
            }
          />
          <div className="flex items-center space-x-3">
            <Label htmlFor="tv">Телевизор</Label>
            <Switch
              id="tv"
              checked={newRoom.tv || false}
              onCheckedChange={(checked) =>
                setNewRoom({ ...newRoom, tv: checked })
              }
            />
            <span className="text-sm text-gray-600">
              {newRoom.tv ? "Да" : "Нет"}
            </span>
          </div>
          <Input
            placeholder="Цена будни"
            value={newRoom.priceWeekdays || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, priceWeekdays: e.target.value })
            }
          />
          <Input
            placeholder="Цена выходные"
            value={newRoom.priceWeekend || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({ ...newRoom, priceWeekend: e.target.value })
            }
          />
          {/* нормализуем URL картинок */}
          <Input
            placeholder="URL картинок (через запятую)"
            value={newRoom.images?.join(", ") || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom({
                ...newRoom,
                images: parseImageUrls(e.target.value),
              })
            }
          />
          <div className="space-y-2">
            <Label htmlFor="room-image-upload">Загрузить изображение (R2)</Label>
            <Input
              id="room-image-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleImageUpload(e.target.files?.[0] ?? null, "rooms", "newRoom")
              }
            />
            {uploadingTarget === "newRoom" && (
              <p className="text-sm text-gray-600">Загрузка файла...</p>
            )}
          </div>
          <Button onClick={createRoom} className="bg-green-700 text-white">
            Создать номер
          </Button>
        </div>
      </TabsContent>

        {/* Создать сруб */}
        <TabsContent value="addCabin">
          <div className="space-y-4 mt-4">
            <Input
              placeholder="Название"
              value={newCabin.title || ""}
              onChange={(e) => setNewCabin({ ...newCabin, title: e.target.value })}
            />
            <Input
              placeholder="Категория"
              value={newCabin.category || ""}
              onChange={(e) => setNewCabin({ ...newCabin, category: e.target.value })}
            />
            <Input
              placeholder="Комнат"
              type="number"
              value={newCabin.rooms || ""}
              onChange={(e) => setNewCabin({ ...newCabin, rooms: +e.target.value })}
            />
            <Input
              placeholder="Этажей"
              type="number"
              value={newCabin.floors || ""}
              onChange={(e) => setNewCabin({ ...newCabin, floors: +e.target.value })}
            />
            <Input
              placeholder="Спальных мест"
              type="number"
              value={newCabin.beds || ""}
              onChange={(e) => setNewCabin({ ...newCabin, beds: +e.target.value })}
            />
            <div className="flex items-center space-x-3">
              <Label htmlFor="pool">Бассейн</Label>
              <Switch
                id="pool"
                checked={newCabin.pool || false}
                onCheckedChange={(checked) => setNewCabin({ ...newCabin, pool: checked })}
              />
              <span className="text-sm text-gray-600">
                {newCabin.pool ? "Да" : "Нет"}
              </span>
            </div>
            <Input
              placeholder="Цена будни"
              value={newCabin.priceWeekdays || ""}
              onChange={(e) =>
                setNewCabin({ ...newCabin, priceWeekdays: e.target.value })
              }
            />
            <Input
              placeholder="Цена выходные"
              value={newCabin.priceWeekend || ""}
              onChange={(e) =>
                setNewCabin({ ...newCabin, priceWeekend: e.target.value })
              }
            />
            <Input
              placeholder="URL картинок (через запятую)"
              value={newCabin.images?.join(", ") || ""}
              onChange={(e) =>
                setNewCabin({
                  ...newCabin,
                  images: parseImageUrls(e.target.value),
                })
              }
            />
            <div className="space-y-2">
              <Label htmlFor="cabin-image-upload">Загрузить изображение (R2)</Label>
              <Input
                id="cabin-image-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleImageUpload(e.target.files?.[0] ?? null, "cabins", "newCabin")
                }
              />
              {uploadingTarget === "newCabin" && (
                <p className="text-sm text-gray-600">Загрузка файла...</p>
              )}
            </div>
            <Button onClick={createCabin} className="bg-green-700 text-white">
              Создать сруб
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
