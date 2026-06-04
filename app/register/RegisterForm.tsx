"use client";

import { useState } from "react";
import Link from "next/link";

type Props = { defaultName: string; email: string };

const DISTANCES = ["5 км", "10 км", "21.1 км", "42.2 км"];

export default function RegisterForm({ defaultName, email }: Props) {
  const parts = defaultName.split(" ");
  const [name, setName] = useState(parts[0] || "");
  const [surname, setSurname] = useState(parts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Мужской");
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bib, setBib] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/runners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, phone, age, gender, distance, city }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Что-то пошло не так");
        return;
      }
      setBib(json.runner.value);
    } catch {
      setError("Ошибка сети. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (bib) {
    return (
      <div className="card success">
        <p className="sub" style={{ marginBottom: 0 }}>Ты в деле! Твой нагрудный номер:</p>
        <div className="bib">{bib}</div>
        <p className="sub">Увидимся на старте 15 июня.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link href="/participants" className="btn btn-primary">К списку участников</Link>
          <Link href="/" className="btn btn-outline">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <div className="form-grid">
        <div className="field">
          <label>Имя *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" />
        </div>
        <div className="field">
          <label>Фамилия *</label>
          <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Иванов" />
        </div>
        <div className="field">
          <label>Email (из Google)</label>
          <input value={email} disabled />
        </div>
        <div className="field">
          <label>Телефон</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 ..." />
        </div>
        <div className="field">
          <label>Возраст</label>
          <input
            type="number"
            min={6}
            max={100}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="18"
          />
        </div>
        <div className="field">
          <label>Пол</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>Мужской</option>
            <option>Женский</option>
          </select>
        </div>
        <div className="field">
          <label>Дистанция</label>
          <select value={distance} onChange={(e) => setDistance(e.target.value)}>
            {DISTANCES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Город</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Астана" />
        </div>
      </div>

      {error ? <div className="msg-error">{error}</div> : null}

      <div className="form-footer">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Отправка…" : "Зарегистрироваться"}
        </button>
        <Link href="/" className="btn btn-outline">Отмена</Link>
      </div>
    </form>
  );
}
