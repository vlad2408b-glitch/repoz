import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/runners - список участников (без личных данных: телефон/почту не отдаём)
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("runners")
      .select("id, name, surname, distance, city, value, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ runners: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/runners - регистрация. Доступна только авторизованным через Google.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const surname = String(body.surname ?? "").trim();
  if (!name || !surname) {
    return NextResponse.json(
      { error: "Имя и фамилия обязательны" },
      { status: 400 }
    );
  }

  // value = нагрудный номер участника. Именно его потом возвращает телеграм-бот.
  const value = String(1000 + Math.floor(Math.random() * 9000));

  const row = {
    user_id: (session.user as any).id || session.user.email,
    name,
    surname,
    email: session.user.email,
    phone: String(body.phone ?? "").trim(),
    age: body.age ? Number(body.age) : null,
    gender: String(body.gender ?? "").trim(),
    distance: String(body.distance ?? "").trim(),
    city: String(body.city ?? "").trim(),
    value,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("runners")
      .insert(row)
      .select("id, name, surname, distance, city, value")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ runner: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
