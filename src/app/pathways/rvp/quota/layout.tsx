import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Квота на РВП в России 2026: как получить, критерии и баллы',
  description: 'Как подать заявление на квоту для РВП в РФ в 2026 году. Порядок отбора кандидатов правительственной комиссией, начисление баллов и проходные критерии.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
