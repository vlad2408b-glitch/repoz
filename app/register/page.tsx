import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // Защищённый маршрут: без авторизации - на /login
    redirect("/login?callbackUrl=/register");
  }

  return (
    <main className="container page">
      <h2>Регистрация</h2>
      <p className="sub">Заполни данные о себе и получи нагрудный номер.</p>
      <RegisterForm
        defaultName={session.user.name ?? ""}
        email={session.user.email ?? ""}
      />
    </main>
  );
}
