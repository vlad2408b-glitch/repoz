"use client";

import { useEffect, useState } from "react";

// Ближайшее 15 июня (марафон каждый год в эту дату), старт в 09:00.
function nextRaceDate(): Date {
  const now = new Date();
  const year = now.getFullYear();
  let race = new Date(year, 5, 15, 9, 0, 0); // месяц 5 = июнь (с нуля)
  if (race.getTime() <= now.getTime()) {
    race = new Date(year + 1, 5, 15, 9, 0, 0);
  }
  return race;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const target = nextRaceDate().getTime();
    const tick = () => setDiff(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const d = diff === null ? 0 : Math.floor(diff / 86400000);
  const h = diff === null ? 0 : Math.floor((diff % 86400000) / 3600000);
  const m = diff === null ? 0 : Math.floor((diff % 3600000) / 60000);
  const s = diff === null ? 0 : Math.floor((diff % 60000) / 1000);

  return (
    <div className="countdown-wrap">
      <div className="cd-title">До старта осталось</div>
      <div className="countdown">
        <div className="cd-box">
          <div className="cd-num">{d}</div>
          <div className="cd-label">дней</div>
        </div>
        <div className="cd-box">
          <div className="cd-num">{pad(h)}</div>
          <div className="cd-label">часов</div>
        </div>
        <div className="cd-box">
          <div className="cd-num">{pad(m)}</div>
          <div className="cd-label">минут</div>
        </div>
        <div className="cd-box">
          <div className="cd-num">{pad(s)}</div>
          <div className="cd-label">секунд</div>
        </div>
      </div>
    </div>
  );
}
