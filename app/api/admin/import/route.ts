import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin";

function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

// Разбирает одну строку CSV с учётом кавычек
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let buf = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { buf += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      fields.push(buf.trim());
      buf = "";
    } else {
      buf += c;
    }
  }
  fields.push(buf.trim());
  return fields;
}

// POST /api/admin/import — принять CSV в теле и записать в Supabase
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await req.text();
  const lines = body
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim());

  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV пустой или нет данных" }, { status: 400 });
  }

  const rawHeaders = parseLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Маппинг возможных заголовков на поля базы
  const map: Record<string, string> = {
    name: "name", имя: "name",
    surname: "surname", фамилия: "surname",
    email: "email", "эл. почта": "email",
    phone: "phone", телефон: "phone",
    age: "age", возраст: "age",
    gender: "gender", пол: "gender",
    "distance (km)": "distance", "дистанция (км)": "distance", distance: "distance", дистанция: "distance",
    city: "city", город: "city",
  };

  const colMap = rawHeaders.map((h) => map[h] ?? null);

  const supabase = getSupabaseAdmin();
  let success = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row: Record<string, any> = {};
    colMap.forEach((field, j) => {
      if (field) row[field] = values[j] ?? "";
    });

    if (!row.name || !row.surname || !row.email) { skipped++; continue; }

    // Генерируем нагрудный номер
    const { count } = await supabase
      .from("runners")
      .select("id", { count: "exact", head: true });
    const num = (count ?? 0) + 1;
    const value = `MS${String(num).padStart(4, "0")}`;

    const { error } = await supabase.from("runners").insert({
      user_id: row.email,
      name: row.name,
      surname: row.surname,
      email: row.email,
      phone: row.phone || "",
      age: parseInt(row.age) || null,
      gender: row.gender || "м",
      distance: row.distance || "5",
      city: row.city || "",
      value,
    });

    if (error) skipped++;
    else success++;
  }

  return NextResponse.json({ success, skipped });
}
