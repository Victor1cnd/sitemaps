export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      return new Response(await env.SITEMAPS.get('sitemap.xml'), {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // Serve robots.txt
    if (url.pathname === '/robots.txt') {
      const robotsContent = `User-agent: *
Allow: /
Sitemap: https://${url.hostname}/sitemap.xml`;
      return new Response(robotsContent, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Default response
    return new Response('Sitemap Server Active', { status: 200 });
  },
};
