"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Calendar, Landmark } from "lucide-react";

type CalcType = "stay" | "patent";

const REGIONAL_PATENT_PRICES: Record<string, number> = {
  "Москва": 7500,
  "Московская область": 7500,
  "Санкт-Петербург": 4600,
  "Ленинградская область": 4600,
  "Краснодарский край": 8100,
  "Свердловская область": 6900,
  "Новосибирская область": 6200,
  "Татарстан": 6450,
  "Приморский край": 9200,
};

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<CalcType>("stay");
  
  // Stay calculator state
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [pastTrips, setPastTrips] = useState<{ entry: string; exit: string }[]>([]);
  const [stayResult, setStayResult] = useState<string | null>(null);

  // Patent calculator state
  const [selectedRegion, setSelectedRegion] = useState("Москва");
  const [months, setMonths] = useState(1);

  const handleAddTrip = () => {
    if (entryDate && exitDate) {
      setPastTrips([...pastTrips, { entry: entryDate, exit: exitDate }]);
      setEntryDate("");
      setExitDate("");
    }
  };

  const handleCalculateStay = () => {
    // Simple 90/180 check explanation simulation
    if (pastTrips.length === 0) {
      setStayResult("У вас нет зарегистрированных прошлых поездок. В текущем 180-дневном периоде вы можете находиться в РФ до 90 дней.");
      return;
    }
    
    // Simulating calculation
    let totalDays = 0;
    pastTrips.forEach(trip => {
      const start = new Date(trip.entry);
      const end = new Date(trip.exit);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalDays += diffDays;
    });

    const remaining = 90 - totalDays;
    if (remaining <= 0) {
      setStayResult(`Внимание! Вы уже исчерпали лимит пребывания в РФ (${totalDays} дн. из 90 разрешенных). Срочно легализуйте статус.`);
    } else {
      setStayResult(`Вы провели в РФ ${totalDays} дней за последний период. У вас осталось ${remaining} дней для легального нахождения в РФ.`);
    }
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Назад на главную
        </Link>
      </div>

      <div className="glass rounded-[2.5rem] p-8 md:p-12 border border-slate-200/50 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[80px] -z-10"></div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          Миграционные калькуляторы
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-medium mb-8">
          Онлайн-расчет сроков нахождения в РФ и стоимости патента на работу.
        </p>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-2xl mb-8 border border-slate-200/10">
          {(["stay", "patent"] as CalcType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-primary-600 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-950 dark:hover:text-slate-200"
              }`}
            >
              {tab === "stay" ? "Калькулятор 90/180" : "Расчет стоимости патента"}
            </button>
          ))}
        </div>

        {activeTab === "stay" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Правило 90 из 180 дней</span>
                Иностранные граждане с безвизовым въездом могут находиться в РФ не более 90 дней суммарно в течение каждого периода в 180 дней.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Дата въезда</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Дата выезда</label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>

            <button
              onClick={handleAddTrip}
              className="px-6 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/10 cursor-pointer"
            >
              Добавить поездку
            </button>

            {pastTrips.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Список поездок:</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-900/50">
                  {pastTrips.map((trip, idx) => (
                    <div key={idx} className="py-2 flex justify-between text-sm">
                      <span>Поездка #{idx + 1}</span>
                      <span className="font-semibold">{trip.entry} — {trip.exit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleCalculateStay}
              className="w-full py-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-5 h-5" /> Рассчитать оставшиеся дни
            </button>

            {stayResult && (
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/20 text-sm font-medium leading-relaxed">
                {stayResult}
              </div>
            )}
          </div>
        )}

        {activeTab === "patent" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
              <Landmark className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">НДФЛ на Патент</span>
                Стоимость патента на работу рассчитывается исходя из фиксированного авансового платежа по НДФЛ и регионального коэффициента субъекта РФ.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Регион работы</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 focus:outline-none focus:border-primary-500 transition-colors font-medium text-slate-700 dark:text-slate-200"
              >
                {Object.keys(REGIONAL_PATENT_PRICES).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Количество месяцев оплаты ({months})</label>
              <input
                type="range"
                min="1"
                max="12"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-primary-500 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                <span>1 мес.</span>
                <span>6 мес.</span>
                <span>12 мес.</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/20 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Итоговый платеж за {months} мес.</span>
              <span className="text-3xl sm:text-4xl font-extrabold text-primary-500">
                {(REGIONAL_PATENT_PRICES[selectedRegion] * months).toLocaleString("ru-RU")} ₽
              </span>
              <span className="text-xs font-bold text-slate-400 block mt-2">
                ({REGIONAL_PATENT_PRICES[selectedRegion]} ₽ в месяц для региона {selectedRegion})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
