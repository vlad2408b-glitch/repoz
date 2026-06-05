import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;

// Хранилище сессий (в памяти, сбрасывается при перезапуске)
const sessions: Record<number, { step: string; data: Record<string, string> }> = {};

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
    [{ text: "✍️ Зарегистрироваться", callback_data: "register" }],
    [{ text: "🔢 Узнать номер участника", callback_data: "bib" }],
    [{ text: "🌐 Перейти на сайт", url: "https://repoz-teal.vercel.app" }],
  ],
};

const DISTANCE_KEYBOARD = {
  inline_keyboard: [
    [{ text: "5 км", callback_data: "dist_5 км" }],
    [{ text: "10 км", callback_data: "dist_10 км" }],
    [{ text: "21.1 км", callback_data: "dist_21.1 км" }],
    [{ text: "42.2 км", callback_data: "dist_42.2 км" }],
  ],
};

const GENDER_KEYBOARD = {
  inline_keyboard: [
    [{ text: "Мужской", callback_data: "gender_Мужской" }],
    [{ text: "Женский", callback_data: "gender_Женский" }],
  ],
};

function generateBib(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

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
        await sendMessage(chatId,
          `🏃 <b>Marathon Skills</b>\n\nMarathon Skills — ежегодный марафон, который проходит <b>15 июня</b> в разных точках планеты.\n\nУчастники со всего мира собираются вместе, чтобы преодолеть себя и пробежать дистанцию на любой уровень подготовки.\n\nЗарегистрируйся и получи нагрудный номер!`,
          MAIN_KEYBOARD
        );
      } else if (data === "distances") {
        await sendMessage(chatId,
          `📏 <b>Дистанции марафона</b>\n\n🟢 <b>5 км</b> — для начинающих\n🔵 <b>10 км</b> — для любителей\n🟡 <b>21.1 км</b> — полумарафон\n🔴 <b>42.2 км</b> — классический марафон\n\nВыбирай дистанцию по душе и регистрируйся!`,
          MAIN_KEYBOARD
        );
      } else if (data === "date") {
        await sendMessage(chatId,
          `📅 <b>Дата и время</b>\n\n🗓 Дата: <b>15 июня</b>\n⏰ Старт: <b>09:00</b>\n📍 Место: в разных городах мира\n\nСледи за обновлениями на нашем сайте!`,
          MAIN_KEYBOARD
        );
      } else if (data === "bib") {
        sessions[chatId] = { step: "bib_surname", data: {} };
        await sendMessage(chatId, `🔢 Напиши свою <b>фамилию</b>, и я найду твой нагрудный номер:`);
      } else if (data === "register") {
        sessions[chatId] = { step: "reg_name", data: {} };
        await sendMessage(chatId, `✍️ <b>Регистрация на марафон</b>\n\nШаг 1/6: Напиши своё <b>имя</b>:`);
      } else if (data.startsWith("dist_")) {
        const distance = data.replace("dist_", "");
        if (sessions[chatId]) {
          sessions[chatId].data.distance = distance;
          sessions[chatId].step = "reg_city";
          await sendMessage(chatId, `✅ Дистанция: <b>${distance}</b>\n\nШаг 6/6: Напиши свой <b>город</b>:`);
        }
      } else if (data.startsWith("gender_")) {
        const gender = data.replace("gender_", "");
        if (sessions[chatId]) {
          sessions[chatId].data.gender = gender;
          sessions[chatId].step = "reg_distance";
          await sendMessage(chatId, `✅ Пол: <b>${gender}</b>\n\nШаг 5/6: Выбери <b>дистанцию</b>:`, DISTANCE_KEYBOARD);
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Обработка текстовых сообщений
    const msg = update?.message;
    const chatId: number | undefined = msg?.chat?.id;
    const text: string = (msg?.text || "").trim();

    if (!chatId) return NextResponse.json({ ok: true });

    if (text === "/start" || text === "/help") {
      sessions[chatId] = undefined as any;
      await sendMessage(chatId,
        `👋 Привет! Я бот марафона <b>Marathon Skills</b>.\n\nВыбери что тебя интересует:`,
        MAIN_KEYBOARD
      );
      return NextResponse.json({ ok: true });
    }

    // Диалог регистрации
    const session = sessions[chatId];
    if (session) {
      if (session.step === "bib_surname") {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from("runners")
          .select("surname, value")
          .ilike("surname", text)
          .limit(1)
          .maybeSingle();

        delete sessions[chatId];

        if (error) {
          await sendMessage(chatId, "❌ Ошибка базы данных. Попробуй позже.", MAIN_KEYBOARD);
        } else if (data) {
          await sendMessage(chatId,
            `✅ Фамилия <b>${data.surname}</b>\n🔢 Нагрудный номер: <b>${data.value}</b>`,
            MAIN_KEYBOARD
          );
        } else {
          await sendMessage(chatId,
            `❌ Фамилия «${text}» не найдена.\n\nПроверь правильность или зарегистрируйся!`,
            MAIN_KEYBOARD
          );
        }
        return NextResponse.json({ ok: true });
      }

      if (session.step === "reg_name") {
        session.data.name = text;
        session.step = "reg_surname";
        await sendMessage(chatId, `✅ Имя: <b>${text}</b>\n\nШаг 2/6: Напиши свою <b>фамилию</b>:`);
      } else if (session.step === "reg_surname") {
        session.data.surname = text;
        session.step = "reg_phone";
        await sendMessage(chatId, `✅ Фамилия: <b>${text}</b>\n\nШаг 3/6: Напиши свой <b>номер телефона</b>:`);
      } else if (session.step === "reg_phone") {
        session.data.phone = text;
        session.step = "reg_age";
        await sendMessage(chatId, `✅ Телефон: <b>${text}</b>\n\nШаг 4/6: Напиши свой <b>возраст</b>:`);
      } else if (session.step === "reg_age") {
        session.data.age = text;
        session.step = "reg_gender";
        await sendMessage(chatId, `✅ Возраст: <b>${text}</b>\n\nШаг 5/6: Выбери <b>пол</b>:`, GENDER_KEYBOARD);
      } else if (session.step === "reg_city") {
        session.data.city = text;

        // Сохраняем в Supabase
        const bib = generateBib();
        const supabase = getSupabaseAdmin();
        const { error } = await supabase.from("runners").insert({
          name: session.data.name,
          surname: session.data.surname,
          phone: session.data.phone,
          age: parseInt(session.data.age) || null,
          gender: session.data.gender,
          distance: session.data.distance,
          city: text,
          value: bib,
          user_id: `tg_${chatId}`,
        });

        delete sessions[chatId];

        if (error) {
          await sendMessage(chatId, "❌ Ошибка при регистрации. Попробуй позже.", MAIN_KEYBOARD);
        } else {
          await sendMessage(chatId,
            `🎉 <b>Ты зарегистрирован!</b>\n\n👤 ${session.data.name} ${session.data.surname}\n📏 Дистанция: ${session.data.distance}\n📍 Город: ${text}\n\n🔢 Твой нагрудный номер: <b>${bib}</b>\n\nУвидимся на старте 15 июня! 🏁`,
            MAIN_KEYBOARD
          );
        }
      }

      return NextResponse.json({ ok: true });
    }

    // Если нет активной сессии — показываем меню
    await sendMessage(chatId,
      `Выбери действие:`,
      MAIN_KEYBOARD
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "telegram webhook alive" });
}