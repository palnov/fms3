import Link from "next/link";
import { ArrowRight, ShieldCheck, FileText, Globe, MapPin } from "lucide-react";

export const metadata = {
  title: "Все пути переезда в Россию: виды на жительство, РВП, Гражданство",
  description: "Каталог всех доступных способов легализации в РФ. Подберите свой путь миграции."
};

export default function PathwaysHub() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Пути <span className="text-primary-600">легализации</span> в РФ</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Выберите нужный статус, чтобы получить подробную инструкцию по оформлению документов.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/pathways/vnzh" className="p-8 glass rounded-[2rem] hover:ring-2 hover:ring-primary-500 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Вид на жительство (ВНЖ)</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Статус, дающий бессрочное право жить и трудиться в РФ. Основания для ВНЖ: брак, профессия из перечня, диплом.
            </p>
          </div>
          <div className="font-bold flex items-center text-primary-600 dark:text-primary-400">
            Перейти к инструкции <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </Link>
        <Link href="/pathways/rvp" className="p-8 glass rounded-[2rem] hover:ring-2 hover:ring-primary-500 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center mb-6">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4">РВП</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Разрешение на временное проживание. Первая ступень к паспорту. Квоты и основания.
            </p>
          </div>
          <div className="font-bold flex items-center text-primary-600 dark:text-primary-400">
            Перейти к инструкции <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </Link>
        <Link href="/pathways/citizenship" className="p-8 glass rounded-[2rem] hover:ring-2 hover:ring-primary-500 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center mb-6">
              <Globe className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Гражданство РФ</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Оформление паспорта Российской Федерации. Упрощенные порядки и изменения в законах.
            </p>
          </div>
          <div className="font-bold flex items-center text-primary-600 dark:text-primary-400">
            Перейти к инструкции <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </Link>
        <Link href="/pathways/repatriation" className="p-8 glass rounded-[2rem] hover:ring-2 hover:ring-primary-500 transition-all flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Программа переселения</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Ускоренный путь миграции для соотечественников. Выбор региона и получение выплат.
            </p>
          </div>
          <div className="font-bold flex items-center text-primary-600 dark:text-primary-400">
            Перейти к инструкции <ArrowRight className="w-5 h-5 ml-2" />
          </div>
        </Link>
      </div>
    </div>
  );
}
