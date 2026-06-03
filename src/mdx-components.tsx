import type { MDXComponents } from 'mdx/types'
import ConsultationBanner from '@/components/mdx/ConsultationBanner'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ConsultationBanner,
    h1: ({ children }) => <h1 className="text-4xl md:text-5xl font-black mb-6 mt-8 tracking-tight text-slate-900 dark:text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-12 text-slate-800 dark:text-slate-100">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mb-3 mt-8 text-slate-800 dark:text-slate-200">{children}</h3>,
    p: ({ children }) => <p className="text-lg leading-relaxed mb-6 text-slate-600 dark:text-slate-400">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-2 text-lg text-slate-600 dark:text-slate-400">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2 text-lg text-slate-600 dark:text-slate-400">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
    ...components,
  }
}
