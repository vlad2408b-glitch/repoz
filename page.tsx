import Link from "next/link";
import Countdown from "./components/Countdown";
import { TELEGRAM_BOT_USERNAME } from "@/lib/config";

export default function HomePage() {
  return (
    <main className="container">
      <section className="hero">
        <span className="kicker">Marathon Skills · 15 июня</span>
        <h1>
          Беги <span className="out">марафон</span>
          <br />
          вместе со всем миром
        </h1>
        <p className="lead">
          Marathon Skills проходит каждый год 15 июня в разных точках планеты.
          Дистанции на любой уровень: от 5 км до классических 42.2 км.
          Зарегистрируйся онлайн, узнай свой BMI и получи нагрудный номер.
        </p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-primary">
            Регистрация
          </Link>
          <Link href="/participants" className="btn btn-outline">
            Список участников
          </Link>
          <a
            href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ background: "#229ED9", color: "#fff" }}
          >
            Написать боту
          </a>
        </div>

        <div className="info-strip">
          <div className="info-card">
            <div className="label">Дата</div>
            <div className="value">15 ИЮНЯ</div>
          </div>
          <div className="info-card">
            <div className="label">Старт</div>
            <div className="value">09:00</div>
          </div>
          <div className="info-card">
            <div className="label">Дистанции</div>
            <div className="value">5 / 10 / 21.1 / 42.2 КМ</div>
          </div>
        </div>

        <Countdown />
      </section>

      {/* Кнопка входа администратора в правом нижнем углу */}
      <Link href="/admin" className="admin-corner">
        Admin
      </Link>
    </main>
  );
}
