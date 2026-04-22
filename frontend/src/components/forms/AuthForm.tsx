"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Input";
import { toast } from "sonner"; 
import { apiUrl } from "@/lib/api";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Введите корректный email");
      return false;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов");
      return false;
    }
    if (!isLogin) {
      if (!formData.firstName || formData.firstName.length < 2) {
        toast.error("Имя должно быть не менее 2 символов");
        return false;
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        toast.error("Фамилия должна быть не менее 2 символов");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const url = isLogin
        ? apiUrl("/auth/login")
        : apiUrl("/auth/register");

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin
            ? { email: formData.email, password: formData.password }
            : {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
              }
        ),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.detail || "❌ Ошибка запроса");
        return;
      }

      const data = await res.json();
      if (isLogin) {
        localStorage.setItem("token", data.access_token);
        toast.success("✅ Успешный вход");
        router.push("/");
      } else {
        toast.success("✅ Регистрация прошла успешно");
        router.push("/auth");
      }
    } catch (err) {
      toast.error("❌ Ошибка соединения с сервером");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <>
          <Input
            type="text"
            name="firstName"
            placeholder="Имя"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
          />
        </>
      )}

      <Input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

      <Input
        type="password"
        name="password"
        placeholder="Пароль"
        value={formData.password}
        onChange={handleChange}
      />

      <Button type="submit" className="w-full">
        {isLogin ? "Войти" : "Зарегистрироваться"}
      </Button>

      <p
        className="text-sm text-gray-600 text-center cursor-pointer mt-2"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Нет аккаунта? Зарегистрироваться"
          : "Уже есть аккаунт? Войти"}
      </p>
    </form>
  );
}
