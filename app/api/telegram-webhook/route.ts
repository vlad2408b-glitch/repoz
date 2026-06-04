import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// Telegram шлёт сюда POST на каждое сообщение (webhook).
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const msg = update?.message;
    const chatId: number | undefined = msg?.chat?.id;
    const text: string = (msg?.text || "").trim();

    if (!chatId) {
      return NextResponse.json({ ok: true });
    }

    if (text === "/start" || text === "/help") {
      await sendMessage(
        chatId,
        "Привет! Пришли мне фамилию участника марафона, и я верну его нагрудный номер."
      );
      return NextResponse.json({ ok: true });
    }

    const surname = text;
    if (!surname) {
      await sendMessage(chatId, "Пришли фамилию обычным текстом.");
      return NextResponse.json({ ok: true });
    }

    // SELECT value FROM runners WHERE surname = '<X>' LIMIT 1 (без учёта регистра)
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("runners")
      .select("surname, value")
      .ilike("surname", surname)
      .limit(1)
      .maybeSingle();

    if (error) {
      await sendMessage(chatId, "Ошибка базы данных. Попробуй позже.");
      return NextResponse.json({ ok: true });
    }

    if (data) {
      await sendMessage(
        chatId,
        `Фамилия <b>${data.surname}</b> → значение: <b>${data.value}</b>`
      );
    } else {
      await sendMessage(chatId, `Фамилия «${surname}» не найдена в базе`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Telegram нужен ответ 200, иначе он будет долбить повторами.
    return NextResponse.json({ ok: true });
  }
}

// GET - чтобы можно было открыть в браузере и проверить, что роут живой.
export async function GET() {
  return NextResponse.json({ status: "telegram webhook alive" });
}
