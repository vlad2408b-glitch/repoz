"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Runner = {
  id: number;
  name: string;
  surname: string;
  distance: string;
  city: string;
  value: string;
};

export default function ParticipantsPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/runners")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setRunners(json.runners || []);
      })
      .catch(() => setError("Не удалось загрузить список"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container page">
      <h2>Участники</h2>
      <p className="sub">Все, кто уже зарегистрировался на марафон.</p>

      {loading ? (
        <div className="spinner">Загрузка…</div>
      ) : error ? (
        <div className="msg-error">{error}</div>
      ) : runners.length === 0 ? (
        <div className="empty">
          Пока никого нет. Будь первым -{" "}
          <Link href="/register" style={{ color: "var(--accent)" }}>зарегистрируйся</Link>.
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Дистанция</th>
                <th>Город</th>
              </tr>
            </thead>
            <tbody>
              {runners.map((r) => (
                <tr key={r.id}>
                  <td><span className="bib-pill">{r.value}</span></td>
                  <td>{r.name}</td>
                  <td>{r.surname}</td>
                  <td>{r.distance}</td>
                  <td>{r.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
