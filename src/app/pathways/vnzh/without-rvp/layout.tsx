import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Кто может получить ВНЖ без РВП в 2026 году',
  description: 'Основания для ВНЖ без РВП: гражданство, родственники, образование, работа и госпрограммы. Требования и порядок подачи.',
  alternates: { canonical: '/pathways/vnzh/without-rvp' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
