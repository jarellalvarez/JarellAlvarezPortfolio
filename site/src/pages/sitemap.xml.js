import { studies } from '../lib/content.mjs';
// Public pages only. Locked case-study content is inside the pages and is not listed here; the admin editor is left out.
export function GET({ site }) {
  const paths = ['/', '/work/', '/about/', '/kind-words/', '/work/earlier/', '/design-system/',
    ...studies().map(s => `/work/${s.slug}/`), ...studies('earlier').map(s => `/work/earlier/${s.slug}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(p => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
