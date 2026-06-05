import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

async function sendMessage(chatId: number, text: string, keyboard?: object) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...(keyboard ? { reply_markup: keyboard } : {}),
    }),
  });
}

async function answerCallbackQuery(callbackQueryId: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

const MAIN_KEYBOARD = {
  inline_keyboard: [
    [{ text: "🏃 О марафоне", callback_data: "about" }],
    [{ text: "📏 Дистанции", callback_data: "distances" }],
    [{ text: "📅 Дата и место", callback_data: "date" }],
    [{ text: "🔢 Узнать номер участника", callback_data: "bib" }],
    [{ text: "🌐 Перейти на сайт", url: "https://repoz-teal.vercel.app" }],
  ],
};

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Обработка нажатия кнопок
    const callbackQuery = update?.callback_query;
    if (callbackQuery) {
      const chatId: number = callbackQuery.message.chat.id;
      const data: string = callbackQuery.data;

      await answerCallbackQuery(callbackQuery.id);

      if (data === "about") {
        await sendMessage(
          chatId,
          `🏃 <b>Marathon Skills</b>\n\nMarathon Skills — ежегодный марафон, который проходит 15 июня в разных точках планеты.\n\nУчастники со всего мира собираются вместе, чтобы преодолеть себя и пробежать дистанцию на любой уровень подготовки.\n\nЗарегистрируйся на сайте и получи нагрудный номер!`,
          MAIN_KEYBOARD
        );
      } else if (data === "distances") {
        await sendMessage(
          chatId,
          `📏 <b>Дистанции марафона</b>\n\n🟢 <b>5 км</b> — для начинающих\n🔵 <b>10 км</b> — для любителей\n🟡 <b>21.1 км</b> — полумарафон\n🔴 <b>42.2 км</b> — классический марафон\n\nВыбирай дистанцию по душе и регистрируйся!`,
          MAIN_KEYBOARD
        );
      } else if (data === "date") {
        await sendMessage(
          chatId,
          `📅 <b>Дата и время</b>\n\n🗓 Дата: <b>15 июня</b>\n⏰ Старт: <b>09:00</b>\n📍 Место: в разных городах мира\n\nСледи за обновлениями на нашем сайте!`,
          MAIN_KEYBOARD
        );
      } else if (data === "bib") {
        await sendMessage(
          chatId,
          `🔢 <b>Узнать номер участника</b>\n\nНапиши свою <b>фамилию</b>, и я найду твой нагрудный номер.`
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Обработка текстовых сообщений
    const msg = update?.message;
    const chatId: number | undefined = msg?.chat?.id;
    const text: string = (msg?.text || "").trim();

    if (!chatId) return NextResponse.json({ ok: true });

    if (text === "/start" || text === "/help") {
      await sendMessage(
        chatId,
        `👋 Привет! Я бот марафона <b>Marathon Skills</b>.\n\nВыбери что тебя интересует:`,
        MAIN_KEYBOARD
      );
      return NextResponse.json({ ok: true });
    }

    // Поиск по фамилии
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("runners")
      .select("surname, value")
      .ilike("surname", text)
      .limit(1)
      .maybeSingle();

    if (error) {
      await sendMessage(chatId, "❌ Ошибка базы данных. Попробуй позже.", MAIN_KEYBOARD);
      return NextResponse.json({ ok: true });
    }

    if (data) {
      await sendMessage(
        chatId,
        `✅ Фамилия <b>${data.surname}</b>\n🔢 Нагрудный номер: <b>${data.value}</b>`,
        MAIN_KEYBOARD
      );
    } else {
      await sendMessage(
        chatId,
        `❌ Фамилия «${text}» не найдена в базе.\n\nПроверь правильность написания или зарегистрируйся на сайте.`,
        MAIN_KEYBOARD
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "telegram webhook alive" });
}