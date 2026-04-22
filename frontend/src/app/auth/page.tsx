"use client";

import AuthForm from "@/components/forms/AuthForm";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Вход / Регистрация
        </h1>
        <AuthForm />
      </div>
    </div>
  );
}
