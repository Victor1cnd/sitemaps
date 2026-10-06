export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      try {
        // Try to fetch sitemap from GitHub raw content
        const sitemapUrl = 'https://raw.githubusercontent.com/Victor1cnd/sitemaps/main/sitemaps/sitemap.xml';
        const sitemapResponse = await fetch(sitemapUrl);
        
        if (sitemapResponse.ok) {
          const xml = await sitemapResponse.text();
          return new Response(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'max-age=3600',
              'Access-Control-Allow-Origin': '*'
            },
          });
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }

      // Fallback sitemap if fetch fails
      const defaultSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${url.hostname}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

      return new Response(defaultSitemap, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // Serve robots.txt
    if (url.pathname === '/robots.txt') {
      const robots = `User-agent: *
Allow: /
Sitemap: https://${url.hostname}/sitemap.xml
`;
      return new Response(robots, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'max-age=86400'
        },
      });
    }

    // Serve XML sitemaps directory listing
    if (url.pathname === '/' || url.pathname === '') {
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Sitemap Server</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .endpoint { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Sitemap Server</h1>
  <p>Google bot discovery endpoints:</p>
  <div class="endpoint">
    <strong>Sitemap:</strong> <a href="/sitemap.xml">/sitemap.xml</a>
  </div>
  <div class="endpoint">
    <strong>Robots:</strong> <a href="/robots.txt">/robots.txt</a>
  </div>
  <p style="color: #666; font-size: 12px; margin-top: 30px;">
    Update your XML files in: <a href="https://github.com/Victor1cnd/sitemaps" target="_blank">Victor1cnd/sitemaps</a>
  </p>
</body>
</html>`;
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Sitemap Worker Active', { status: 200 });
  },
};
