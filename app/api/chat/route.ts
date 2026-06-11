import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `Ты — ИИ-помощник марафона Marathon Skills 2026.
Отвечай только на русском языке. Будь дружелюбным и лаконичным.

О марафоне:
- Название: Marathon Skills 2026
- Дата проведения: 15 июня 2026 года, 09:00
- Доступные дистанции: 5 км, 10 км, 21.1 км (полумарафон), 42.2 км (марафон)
- Регистрация: через сайт или мобильное приложение Marathon Skills
- Номер участника выдаётся автоматически при регистрации (формат: MS0001)

Правила:
- Минимальный возраст: 16 лет для 5/10 км, 18 лет для 21.1 км, 20 лет для 42.2 км
- Обязательно иметь нагрудный номер на старте
- Запрещено использование роликов, велосипедов, самокатов на трассе
- В случае плохого самочувствия обратитесь к волонтёрам

Часто задаваемые вопросы:
- Как найти своё имя? Через раздел "Участники" на сайте.
- Где получить нагрудный номер? На старте, 15 июня с 7:00 до 8:45.
- Можно ли изменить дистанцию? Только через организаторов до 10 июня.

Если вопрос не о марафоне — вежливо перенаправь к теме. Отвечай не более 3-4 предложений.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY не задан в переменных окружения" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ text });
}
