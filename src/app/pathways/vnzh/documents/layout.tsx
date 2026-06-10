import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Документы на ВНЖ в России 2026: полный список и правила подачи',
  description: 'Актуальный перечень документов для оформления вида на жительство (ВНЖ) в РФ в 2026 году. Порядок перевода паспорта, подтверждение доходов и прохождение медкомиссии.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
