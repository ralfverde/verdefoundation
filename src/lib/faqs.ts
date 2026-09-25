import { getCollection } from 'astro:content';
import type { Lang } from './i18n';

/** FAQPage JSON-LD for a FAQ group. */
export async function faqJsonLd(lang: Lang, group: 'programas' | 'donar') {
  const faqs = (await getCollection('faqs', (f) => f.id.startsWith(`${lang}/`) && f.data.group === group)).sort(
    (a, b) => a.data.order - b.data.order,
  );
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.data.question,
      acceptedAnswer: { '@type': 'Answer', text: f.body.trim() },
    })),
  };
}
