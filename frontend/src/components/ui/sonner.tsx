"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: "rounded-xl shadow-lg border border-gray-200 bg-white p-4",
          title: "text-gray-900 font-medium",
          description: "text-gray-600 text-sm",
          actionButton:
            "bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-700",
          cancelButton:
            "bg-transparent border border-gray-300 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100",
        },
      }}
      {...props}
    />
  );
}
