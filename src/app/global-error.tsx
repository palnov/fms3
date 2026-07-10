"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f4f6fa", color: "#1f2c41" }}>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px" }}>
          <h1>Сервис временно недоступен</h1>
          <p>Обновите страницу или повторите попытку немного позже.</p>
          <button type="button" onClick={reset} style={{ padding: "12px 18px", border: 0, borderRadius: 10, background: "#02629f", color: "white", fontWeight: 700 }}>Повторить</button>
        </main>
      </body>
    </html>
  );
}
