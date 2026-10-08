"use client";

import { useRouter } from "next/navigation";

export default function YearSelect({ years, value, className }) {
  const router = useRouter();

  return (
    <select
      id="year"
      className={className}
      value={value}
      onChange={(event) => router.push(`/?year=${event.target.value}`)}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}
