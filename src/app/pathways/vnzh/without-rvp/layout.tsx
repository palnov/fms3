import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Кто может получить ВНЖ в России без РВП в 2026 году',
  description: 'Полный список оснований для упрощенного оформления вида на жительство (ВНЖ) в РФ напрямую. Категории граждан, требования к профессии и образованию.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
