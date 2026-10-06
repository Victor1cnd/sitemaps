const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Victor1cnd/sitemaps/main/sitemaps';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Serve a specific XML file from GitHub raw URL
    if (url.pathname.endsWith('.xml')) {
      const fileName = url.pathname.replace(/^\//, '');
      const githubUrl = `${GITHUB_RAW_URL}/${fileName}`;

      try {
        const response = await fetch(githubUrl);
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

    // Homepage: show the actual XML content of each file inline, not just file names
    if (url.pathname === '/' || url.pathname === '') {
      try {
        const apiUrl = 'https://api.github.com/repos/Victor1cnd/sitemaps/contents/sitemaps';
        const response = await fetch(apiUrl);

        if (response.ok) {
          const files = await response.json();
          const xmlFiles = files.filter(file => file.name.endsWith('.xml'));

          let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Sitemap Files</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f7f7f7; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 1px 5px rgba(0,0,0,.08); }
    h1 { margin-bottom: 20px; }
    pre { background: #111; color: #eee; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">`;

          if (xmlFiles.length === 0) {
            html += '<div class="card"><h2>No XML sitemap files found.</h2></div>';
          } else {
            for (const file of xmlFiles) {
              const rawUrl = `${GITHUB_RAW_URL}/${file.name}`;
              const xmlText = await fetch(rawUrl).then(r => r.ok ? r.text() : '');

              html += `
                <div class="card">
                  <h2><a href="/${file.name}">${file.name}</a></h2>
                  <pre>${escapeHtml(xmlText)}</pre>
                </div>
              `;
            }
          }

          html += `</div></body></html>`;
          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        }
      } catch (error) {
        console.error('GitHub API failed:', error);
      }
    }

    return new Response('No sitemap files found.', { status: 404 });
  },
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
