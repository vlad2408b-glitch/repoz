"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        MARATHON<span>SKILLS</span>
      </Link>
      <nav>
        <Link href="/participants">Участники</Link>
        <Link href="/register">Регистрация</Link>
        {status === "authenticated" && session?.user ? (
          <div className="user">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" referrerPolicy="no-referrer" />
            ) : null}
            <span>{session.user.name}</span>
            <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Выйти
            </button>
          </div>
        ) : (
          <button className="btn-ghost" onClick={() => signIn("google")}>
            Войти
          </button>
        )}
      </nav>
    </header>
  );
}
