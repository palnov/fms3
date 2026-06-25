import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import ConsultationBanner from '@/components/mdx/ConsultationBanner'
import {
  ArticleMeta,
  FaqAccordion,
  LegalSource,
  Notice,
  QuickAnswer,
  RelatedGuide,
  Warning,
} from '@/components/mdx/ContentBlocks'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ArticleMeta,
    ConsultationBanner,
    FaqAccordion,
    LegalSource,
    Notice,
    QuickAnswer,
    RelatedGuide,
    Warning,
    a: ({ href, children, ...props }) => {
      const isInternal = href && (href.startsWith('/') || href.startsWith('.') || !href.includes(':'));
      if (isInternal) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    ...components,
  }
}

