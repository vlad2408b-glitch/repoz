"use client";

import { useState } from "react";
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
