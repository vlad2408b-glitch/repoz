"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

const QUICK = [
  "Какие дистанции доступны?",
  "Когда и где марафон?",
  "Как получить нагрудный номер?",
  "Правила участия",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Привет! 👋 Я ИИ-помощник марафона Marathon Skills 2026.\nЗадавай любые вопросы о регистрации, дистанциях, правилах и деталях мероприятия.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { role: "user", content: msg };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ошибка");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.text },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Извините, произошла ошибка. Попробуйте позже.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container page" style={{ maxWidth: 680 }}>
      <h2>ИИ-помощник</h2>
      <p className="sub">Задавай вопросы о Marathon Skills 2026</p>

      {/* Чат */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "16px 16px 12px",
          minHeight: 360,
          maxHeight: 480,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background:
                  m.role === "user"
                    ? "var(--accent)"
                    : m.error
                    ? "rgba(220,50,50,0.12)"
                    : "var(--surface-2)",
                color:
                  m.role === "user"
                    ? "var(--accent-ink)"
                    : "var(--text)",
                border: m.error ? "1px solid rgba(220,50,50,0.3)" : "none",
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "14px 14px 14px 4px",
                background: "var(--surface-2)",
                color: "var(--muted)",
                fontSize: 14,
              }}
            >
              Печатает…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Быстрые вопросы */}
      {messages.length <= 1 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="btn btn-outline"
              style={{ fontSize: 13, padding: "6px 14px" }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Спросить о марафоне..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: "10px 20px" }}
        >
          Отправить
        </button>
      </div>
    </main>
  );
}
