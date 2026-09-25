import type { APIRoute, GetStaticPaths } from 'astro';
import { eventEntries, toView } from '../../lib/events';
import { dict, LANGS } from '../../lib/i18n';
import { ogImage } from '../../lib/og';

// One social card per page and language: /og/<lang>/<key>.png
export const getStaticPaths = (async () => {
  const entries = await eventEntries();
  return LANGS.flatMap((lang) => {
    const t = dict(lang);
    const pages: [string, string, string][] = [
      ['inicio', t.home.heroTitle.replace(/<[^>]+>/g, ''), t.home.heroPill],
      ['mision', t.mision.title, t.pageTitles.mision],
      ['programas', t.programas.title, t.pageTitles.programas],
      ['eventos', t.eventos.title, t.eventos.pill],
      ['involucrate', t.involucrate.title, t.pageTitles.involucrate],
      ['donar', t.donar.title, t.pageTitles.donar],
      ['contacto', t.contacto.title, t.pageTitles.contacto],
      ['privacidad', t.legal.privacy.title, t.legal.privacy.pill],
      ['terminos', t.legal.terms.title, t.legal.terms.pill],
    ];
    for (const e of entries) {
      const v = toView(e, lang);
      pages.push([`eventos/${e.slug}`, v.title, `${v.dateMedium} · ${v.city}, FL`]);
    }
    return pages.map(([key, title, eyebrow]) => ({ params: { path: `${lang}/${key}` }, props: { title, eyebrow } }));
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(await ogImage(props.title, props.eyebrow), { headers: { 'Content-Type': 'image/png' } });
