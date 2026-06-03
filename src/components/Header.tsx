import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/40 dark:border-slate-800/30">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-slate-800 dark:from-primary-400 dark:to-slate-200">
          Миграция РФ
        </Link>
        
        <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/pathways/vnzh" className="hover:text-primary-500 transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary-500 after:transition-all">ВНЖ</Link>
          <Link href="/pathways/rvp" className="hover:text-primary-500 transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary-500 after:transition-all">РВП</Link>
          <Link href="/pathways/citizenship" className="hover:text-primary-500 transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary-500 after:transition-all">Гражданство</Link>
          <Link href="/tools/calculator" className="hover:text-primary-500 transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary-500 after:transition-all">Калькулятор шансов</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/tools/calculator" 
            className="hidden sm:inline-flex px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-sm"
          >
            Начать оценку
          </Link>
        </div>
      </div>
    </header>
  );
}

