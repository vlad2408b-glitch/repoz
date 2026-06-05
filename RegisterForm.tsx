"use client";

import { useState } from "react";
import Link from "next/link";
import { TELEGRAM_BOT_USERNAME } from "@/lib/config";

type Props = { defaultName: string; email: string };

const DISTANCES = ["5 км", "10 км", "21.1 км", "42.2 км"];

// Категория по индексу массы тела (нормы ВОЗ)
function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Недобор веса", color: "#5fa8ff" };
  if (bmi < 25) return { label: "Идеальное значение", color: "var(--accent)" };
  if (bmi < 30) return { label: "Избыточный вес", color: "#ffb02e" };
  return { label: "Ожирение", color: "#ff5d2e" };
}

export default function RegisterForm({ defaultName, email }: Props) {
  const parts = defaultName.split(" ");
  const [name, setName] = useState(parts[0] || "");
  const [surname, setSurname] = useState(parts.slice(1).join(" ") || "");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Мужской");
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [city, setCity] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ bib: string; bmi: number } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const h = Number(height);
    const w = Number(weight);
    if (!name.trim() || !surname.trim()) {
      setError("Имя и фамилия обязательны");
      return;
    }
    if (!h || !w || h < 50 || h > 250 || w < 20 || w > 300) {
      setError("Укажи корректные рост (см) и вес (кг) для расчёта BMI");
      return;
    }

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
      const m = h / 100;
      const bmi = w / (m * m); // BMI = вес(кг) / рост(м)^2
      setResult({ bib: json.runner.value, bmi });
    } catch {
      setError("Ошибка сети. Попробуй ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    const cat = bmiCategory(result.bmi);
    return (
      <div className="card success">
        <p className="sub" style={{ marginBottom: 0 }}>Ты в деле! Твой нагрудный номер:</p>
        <div className="bib">{result.bib}</div>

        <div
          style={{
            margin: "18px auto",
            maxWidth: 360,
            padding: 18,
            border: "1px solid var(--border)",
            borderRadius: 14,
            background: "var(--bg)",
          }}
        >
          <div className="cd-title" style={{ marginBottom: 8 }}>
            Твой индекс массы тела (BMI)
          </div>
          <div
            style={{
              fontFamily: "var(--display)",
              fontSize: 56,
              lineHeight: 1,
              color: cat.color,
            }}
          >
            {result.bmi.toFixed(1)}
          </div>
          <div
            style={{
              marginTop: 6,
              fontWeight: 700,
              color: cat.color,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {cat.label}
          </div>
        </div>

        <p className="sub">Увидимся на старте 15 июня.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/participants" className="btn btn-primary">
            К участникам
          </Link>
          <a
            href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ background: "#229ED9", color: "#fff" }}
          >
            Написать боту
          </a>
          <Link href="/" className="btn btn-outline">
            На главную
          </Link>
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
          <label>Рост (см) *</label>
          <input
            type="number"
            min={50}
            max={250}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="180"
          />
        </div>
        <div className="field">
          <label>Вес (кг) *</label>
          <input
            type="number"
            min={20}
            max={300}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="72"
          />
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
        <Link href="/" className="btn btn-outline">
          Отмена
        </Link>
      </div>
    </form>
  );
}
