import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Упрощённое гражданство РФ в 2026 году',
  description: 'Кто может получить гражданство России в упрощённом порядке по ФЗ-138: семейные, государственные и специальные основания.',
  alternates: { canonical: '/pathways/citizenship/simplified' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
