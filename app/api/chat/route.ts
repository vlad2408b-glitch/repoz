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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY не задан в переменных окружения" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return NextResponse.json({ error: err }, { status: response.status });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";
  return NextResponse.json({ text });
}
