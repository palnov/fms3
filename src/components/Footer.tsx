import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#d8dee7] bg-white">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1fr_auto_auto]">
        <div className="max-w-md">
          <strong className="text-lg font-extrabold tracking-[-0.04em]">Миграционный справочник</strong>
          <p className="mt-3 text-sm leading-6 text-[#667287]">
            Понятные инструкции и сервисы на основе законодательства и официальных материалов. Сайт не является государственным органом.
          </p>
        </div>
        <div className="grid content-start gap-2 text-sm font-semibold text-[#667287]">
          <Link href="/pathways/vnzh">Вид на жительство</Link>
          <Link href="/pathways/rvp">РВП</Link>
          <Link href="/pathways/citizenship">Гражданство</Link>
        </div>
        <div className="grid content-start gap-2 text-sm font-semibold text-[#667287]">
          <Link href="/tools/calculators">Калькуляторы</Link>
          <Link href="/tools/document-check">Проверка документов</Link>
          <Link href="/tools/ai-consultant">ИИ-помощник</Link>
        </div>
      </div>
      <div className="border-t border-[#d8dee7]">
        <div className="site-container flex flex-col gap-2 py-4 text-xs text-[#7b8799] sm:flex-row sm:justify-between">
          <span>© 2026 Миграционный справочник</span>
          <span>Информация носит справочный характер</span>
        </div>
      </div>
    </footer>
  );
}
