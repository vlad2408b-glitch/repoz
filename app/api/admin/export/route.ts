import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin";

function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${ADMIN_TOKEN}`;
}

// GET /api/admin/export — скачать всех участников как CSV
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("runners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];

  // Заголовки CSV
  const headers = [
    "Номер",
    "Имя",
    "Фамилия",
    "Email",
    "Телефон",
    "Возраст",
    "Пол",
    "Дистанция (км)",
    "Город",
    "Дата регистрации",
  ];

  function escape(val: unknown): string {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function formatDate(iso: string | null): string {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleString("ru-RU");
    } catch {
      return iso;
    }
  }

  const lines = [
    headers.join(","),
    ...rows.map((r: any) =>
      [
        escape(r.value),
        escape(r.name),
        escape(r.surname),
        escape(r.email),
        escape(r.phone),
        escape(r.age),
        escape(r.gender),
        escape(r.distance),
        escape(r.city),
        escape(formatDate(r.created_at)),
      ].join(",")
    ),
  ];

  // UTF-8 BOM чтобы Excel правильно открывал кириллицу
  const bom = "\uFEFF";
  const csv = bom + lines.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="marathon_participants_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
