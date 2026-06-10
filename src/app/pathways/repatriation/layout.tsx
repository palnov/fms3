import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Государственная программа переселения соотечественников 2026',
  description: 'Всё о программе переселения соотечественников в РФ. Как получить подъемные выплаты, выбрать регион и оформить гражданство.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
