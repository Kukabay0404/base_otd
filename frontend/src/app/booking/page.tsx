import BookingClient from "./BookingClient";
import type { Room } from "@/components/RoomCard";
import { apiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function BookingPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const hasPrefillParams = Boolean(
    resolvedSearchParams.checkIn ||
      resolvedSearchParams.checkOut ||
      resolvedSearchParams.guests,
  );

  // Skip blocking initial fetch when we already have filters in URL.
  let initialRooms: Room[] = [];

  if (!hasPrefillParams) {
    try {
      const url = apiUrl("/room_admin/public");

      const timeoutMs = 800;
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), timeoutMs);
      });

      const fetchPromise = fetch(url, { cache: "no-store" }).catch((err) => {
        console.error("Server fetch failed (network):", err, url);
        return null;
      });

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && "ok" in res && res.ok) {
        initialRooms = await res.json();
      } else if (res && "ok" in res && !res.ok) {
        console.error("Server fetch returned non-ok status", res.status, url);
      }
    } catch (err) {
      console.error("Server fetch unexpected error for initial rooms", err);
    }
  }

  const initialFetchError = !hasPrefillParams && initialRooms.length === 0;
  return (
    <BookingClient
      initialRooms={initialRooms}
      initialFetchError={initialFetchError}
    />
  );
}
