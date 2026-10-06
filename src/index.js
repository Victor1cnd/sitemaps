const OWNER = 'Victor1cnd';
const REPO = 'sitemaps';
const BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Serve robots.txt for Google bots
    if (url.pathname === '/robots.txt') {
      const robots = `User-agent: *
Allow: /
Sitemap: https://${url.hostname}/sitemap-index.xml
`;
      return new Response(robots, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'max-age=86400'
        }
      });
    }

    // Serve sitemap index that lists all XML files
    if (url.pathname === '/sitemap-index.xml') {
      try {
        const res = await fetch(`${BASE}/sitemaps`);
        if (!res.ok) {
          return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            headers: { 'Content-Type': 'application/xml; charset=utf-8' }
          });
        }

        const items = await res.json();
        const xmlFiles = items.filter(f => f.name.endsWith('.xml'));

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        xmlFiles.forEach(file => {
          sitemap += `  <sitemap>\n    <loc>https://${url.hostname}/${encodeURIComponent(file.name)}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </sitemap>\n`;
        });

        sitemap += '</sitemapindex>';

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'max-age=3600'
          }
        });
      } catch (error) {
        return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' }
        });
      }
    }

    // Serve XML sitemaps from sitemaps directory
    if (url.pathname.endsWith('.xml') && !url.pathname.includes('sitemap-index')) {
      try {
        const fileName = url.pathname.replace(/^\//, '');
        const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/sitemaps/${fileName}`;
        
        const response = await fetch(rawUrl);
        if (response.ok) {
          const xml = await response.text();
          return new Response(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'max-age=3600',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      } catch (error) {
        console.error('XML fetch failed:', error);
      }
    }

    // Homepage: display all repository files for humans
    if (url.pathname === '/' || url.pathname === '') {
      try {
        const res = await fetch(BASE);
        if (!res.ok) {
          return new Response('Could not load repository contents', { status: 500 });
        }

        const items = await res.json();

        let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="robots" content="index, follow" />
  <meta name="description" content="Sitemap Server - Google bot discovery for indexed URLs" />
  <title>Sitemap Repository</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f7f7f7; }
    .container { max-width: 900px; margin: 0 auto; }
    .card { background: white; padding: 20px; border-radius: 10px; margin-bottom: 18px; box-shadow: 0 1px 5px rgba(0,0,0,.08); }
    h1 { color: #333; }
    .file-list { list-style: none; padding: 0; }
    .file-item { padding: 10px; margin: 5px 0; background: #f9f9f9; border-left: 4px solid #0066cc; border-radius: 4px; }
    .file-item a { color: #0066cc; text-decoration: none; font-weight: 500; }
    .file-item a:hover { text-decoration: underline; }
    .file-type { color: #666; font-size: 12px; margin-left: 10px; }
    .seo-info { background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    pre { background: #111; color: #eee; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>📍 Sitemap Repository Server</h1>
      <p>Google bot discovery and indexing for all sitemaps</p>
    </div>

    <div class="seo-info">
      <h3>🤖 For Google Bots:</h3>
      <ul>
        <li><strong>Sitemap Index:</strong> <a href="/sitemap-index.xml">/sitemap-index.xml</a></li>
        <li><strong>Robots:</strong> <a href="/robots.txt">/robots.txt</a></li>
      </ul>
      <p style="font-size: 12px; color: #555;">Google will crawl all sitemaps listed in sitemap-index.xml</p>
    </div>

    <div class="card">
      <h2>📂 Repository Contents</h2>
      <ul class="file-list">`;

        items.forEach(item => {
          const type = item.type === 'dir' ? '📁' : '📄';
          html += `<li class="file-item">
            <a href="/${encodeURIComponent(item.name)}">${type} ${item.name}</a>
            <span class="file-type">(${item.type})</span>
          </li>`;
        });

        html += `</ul>
    </div>

    <div class="card">
      <h3>Daily Workflow:</h3>
      <ol>
        <li>Edit XML files in <code>/sitemaps/</code> directory on <a href="https://github.com/Victor1cnd/sitemaps" target="_blank">GitHub</a></li>
        <li>Worker automatically fetches latest XML files</li>
        <li>Google bots crawl <a href="/sitemap-index.xml">/sitemap-index.xml</a> and discover all URLs</li>
        <li>Add new URLs daily without breaking the website</li>
      </ol>
    </div>
  </div>
</body>
</html>`;

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Robots-Tag': 'index, follow'
          }
        });
      } catch (error) {
        return new Response('Repository fetch failed', { status: 500 });
      }
    }

    // Display file contents
    const path = decodeURIComponent(url.pathname.replace(/^\//, ''));
    const fileUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${path}`;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return new Response('File not found', { status: 404 });
      }

      const text = await response.text();

      return new Response(
        `<html><head><meta charset="UTF-8" /><title>${path}</title></head><body><pre>${escapeHtml(text)}</pre></body></html>`,
        {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    } catch (error) {
      return new Response('Failed to read file', { status: 500 });
    }
  }
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
