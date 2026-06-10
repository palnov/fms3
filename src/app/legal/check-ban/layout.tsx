import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Как проверить и снять запрет на въезд в РФ (Депортация) 2026',
  description: 'Бесплатная инструкция по проверке запрета на въезд в Россию через базу МВД. Отличия депортации от выдворения и способы обжалования в суде.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
