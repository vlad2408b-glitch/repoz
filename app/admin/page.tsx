"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Runner = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  age: number | null;
  gender: string;
  distance: string;
  city: string;
  value: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [runners, setRunners] = useState<Runner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Экспорт/импорт
  const [importStatus, setImportStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // токен совпадает с ADMIN_TOKEN на сервере (по умолчанию "admin")
  const token = "admin";

  async function loadRunners() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/runners", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Ошибка");
      else setRunners(json.runners || []);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  function doLogin(e: React.FormEvent) {
    e.preventDefault();
    if (login === "admin" && password === "admin") {
      setAuthed(true);
      setLoginError("");
      loadRunners();
    } else {
      setLoginError("Неверный логин или пароль");
    }
  }

  async function remove(id: number) {
    if (!confirm("Удалить участника?")) return;
    const res = await fetch(`/api/admin/runners?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setRunners((prev) => prev.filter((r) => r.id !== id));
    else alert("Не удалось удалить");
  }

  // Скачать CSV
  function exportCsv() {
    const link = document.createElement("a");
    link.href = "/api/admin/export";
    // Передаём токен через URL недоступно, поэтому делаем fetch и создаём blob
    fetch("/api/admin/export", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `marathon_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      });
  }

  // Импорт из CSV-файла
  async function importCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("Загрузка…");

    const text = await file.text();
    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: text,
    });
    const json = await res.json();
    if (res.ok) {
      setImportStatus(`✅ Импортировано: ${json.success}, пропущено: ${json.skipped}`);
      loadRunners();
    } else {
      setImportStatus(`❌ Ошибка: ${json.error}`);
    }
    // Сбросить input чтобы можно было загрузить тот же файл повторно
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!authed) {
    return (
      <main className="container center-wrap">
        <form className="center-card card" onSubmit={doLogin}>
          <h2>Админ-панель</h2>
          <p className="sub">Вход для организатора (admin / admin).</p>
          <div className="field full" style={{ marginBottom: 14, textAlign: "left" }}>
            <label>Логин</label>
            <input value={login} onChange={(e) => setLogin(e.target.value)} placeholder="admin" />
          </div>
          <div className="field full" style={{ marginBottom: 14, textAlign: "left" }}>
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
            />
          </div>
          {loginError ? <div className="msg-error">{loginError}</div> : null}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Login
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => router.push("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="container page">
      <h2>Админ-панель</h2>
      <p className="sub">Все зарегистрированные участники. Всего: {runners.length}</p>

      {/* Кнопки экспорт/импорт */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <button className="btn btn-outline" onClick={exportCsv}>
          ⬇ Скачать CSV
        </button>
        <label className="btn btn-outline" style={{ cursor: "pointer" }}>
          ⬆ Импорт CSV
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={importCsv}
          />
        </label>
        {importStatus && (
          <span style={{ fontSize: 13, color: "var(--muted)" }}>{importStatus}</span>
        )}
        <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>
          CSV формат: name, surname, email, phone, age, gender, distance, city
        </span>
      </div>

      {loading ? (
        <div className="spinner">Загрузка…</div>
      ) : error ? (
        <div className="msg-error">{error}</div>
      ) : runners.length === 0 ? (
        <div className="empty">Участников пока нет.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Номер</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Возраст</th>
                <th>Пол</th>
                <th>Дистанция</th>
                <th>Город</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runners.map((r) => (
                <tr key={r.id}>
                  <td><span className="bib-pill">{r.value}</span></td>
                  <td>{r.name}</td>
                  <td>{r.surname}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.age ?? ""}</td>
                  <td>{r.gender}</td>
                  <td>{r.distance}</td>
                  <td>{r.city}</td>
                  <td>
                    <button className="btn-danger" onClick={() => remove(r.id)}>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
