'use client'
import { useEffect, useState } from "react";

function calculateAvailableSlotsMathematically(
  openingTime: string,
  closingTime: string,
  bookingInterval: number
): string[] {
  const timeToMinutes = (time: string): number =>
    time.split(":").reduce((acc, part, index) => acc + Number(part) * (index === 0 ? 60 : 1), 0);

  const minutesToTime = (minutes: number): string =>
    [Math.floor(minutes / 60).toString().padStart(2, "0"), (minutes % 60).toString().padStart(2, "0")].join(":");

  const start = timeToMinutes(openingTime);
  const end = timeToMinutes(closingTime);

  const slots = Array.from(
    { length: Math.floor((end - start) / bookingInterval) + 1 },
    (_, i) => minutesToTime(start + i * bookingInterval)
  );

  return slots;
}

export default function Home() {
  const [slots, setSlots] = useState<{ start: string }[]>([]);

  useEffect(() => {
    const openingTime = "12:00";
    const closingTime = "22:00";
    const bookingInterval = 30;
    const calculatedSlots = calculateAvailableSlotsMathematically(
      openingTime,
      closingTime,
      bookingInterval
    );
    setSlots(calculatedSlots.map((slot) => ({ start: slot }))); // Corretto mapping
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start bg-white p-10 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Orari disponibili</h1>
        <ul className="list-disc list-inside text-gray-600">
          {slots.map((slot, index) => (
            <li key={index} className="py-1 text-lg">
              <span className="font-medium text-gray-700">{slot.start}</span>
            </li>
          ))}
        </ul>
      </main>
      
    </div>
  );
}
