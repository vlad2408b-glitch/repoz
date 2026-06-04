import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Marathon Skills - Регистрация участников",
  description: "Ежегодный марафон Marathon Skills. 15 июня. Регистрируйся онлайн.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className="container">
            <Header />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
