import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Загрузка...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
