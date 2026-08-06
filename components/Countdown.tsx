"use client";

import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const ms = Math.max(0, target.getTime() - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);

  return (
    <div className="flex items-baseline gap-2 tnum">
      <span className="text-5xl font-bold leading-none sm:text-6xl">{days}</span>
      <span className="text-sm text-muted-foreground">天</span>
      <span className="text-xl font-semibold leading-none">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
        {String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
