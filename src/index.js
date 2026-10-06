const defaultSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-10-06</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/sitemap.xml') {
      const xmlFromKv = env.SITEMAPS ? await env.SITEMAPS.get('sitemap.xml') : null;
      const xml = xmlFromKv || env.DEFAULT_SITEMAP || defaultSitemap;

      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    if (url.pathname === '/robots.txt') {
      const robots = `User-agent: *\nAllow: /\nSitemap: https://${url.hostname}/sitemap.xml\n`;
      return new Response(robots, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response('Sitemap worker is running.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
