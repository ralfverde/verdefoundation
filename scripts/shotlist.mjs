// Regenerates PHOTO-SHOTLIST.md from src/data/photos.json and the events
// collection. Run: npm run shotlist
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

const photos = JSON.parse(readFileSync('src/data/photos.json', 'utf8'));
const imgDir = 'src/assets/img';
const exts = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const status = (id) => (exts.some((e) => existsSync(`${imgDir}/${id}.${e}`)) ? 'Listo' : 'Pendiente');

const field = (src, key) => {
  const m = src.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1].replace(/\\"/g, '"') : '';
};
const events = readdirSync('src/content/events')
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => {
    const src = readFileSync(`src/content/events/${f}`, 'utf8');
    const slug = f.replace(/\.md$/, '');
    return { id: `eventos/${slug}`, page: `/eventos, /eventos/${slug}, tarjetas en / y /programas`, alt: field(src, 'photo'), title: field(src, 'title') };
  });

const rows = [
  ...Object.entries(photos).map(([id, p]) => ({ id, page: p.page, alt: p.alt.es, tag: p.tag?.es ?? '' })),
  ...events.map((e) => ({ id: e.id, page: e.page, alt: e.alt, tag: `Evento: ${e.title}` })),
];

const esc = (s) => String(s).replace(/\|/g, '\\|');
const out = `# Lista de fotos (photo shot list)

Cada foto del sitio es por ahora un marcador de posición (\`figure.ph\`). Para
reemplazar uno, guarda la imagen en \`src/assets/img/<archivo>.jpg\` (también
sirve .png, .webp o .avif) con la ruta exacta de la columna **Archivo**. El
componente \`Photo.astro\` la detecta en el siguiente build, la optimiza y
quita el marcador. La descripción se usa como texto alternativo.

Recomendaciones: mínimo 1600 px de ancho para fotos grandes (cabeceras,
bloques de programas), 800 px para tarjetas y retratos; horizontal salvo los
retratos y la galería (cuadradas). Pide permiso por escrito a las personas
que aparezcan.

Este archivo se genera con \`npm run shotlist\`. Total: ${rows.length} fotos.

| # | Archivo | Página y sección | Descripción (data-photo) | Etiqueta en el marcador | Estado |
|---|---------|------------------|--------------------------|-------------------------|--------|
${rows.map((r, i) => `| ${i + 1} | \`${r.id}.jpg\` | ${esc(r.page)} | ${esc(r.alt)} | ${esc(r.tag)} | ${status(r.id)} |`).join('\n')}

Notas:

- Las fotos de eventos (\`eventos/<slug>.jpg\`) se usan en la tarjeta, la fila del calendario y la cabecera de la página del evento. Al crear un evento nuevo, su foto aparece aquí automáticamente.
- \`contacto/mapa\` es un mapa, no una foto: puede ser una captura estática del mapa con la sede marcada, o quedarse como marcador hasta tener dirección.
- Las seis fotos de la galería del pie de página son cuadradas y pequeñas (se muestran a unos 80 px).
`;
writeFileSync('PHOTO-SHOTLIST.md', out);
console.log(`PHOTO-SHOTLIST.md: ${rows.length} photos`);
