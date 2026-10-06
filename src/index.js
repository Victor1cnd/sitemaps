const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Victor1cnd/sitemaps/main/sitemaps';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve any XML file from the sitemaps directory
    if (url.pathname.endsWith('.xml')) {
      try {
        const fileName = url.pathname.replace(/^\//, ''); // Remove leading slash
        const githubUrl = `${GITHUB_RAW_URL}/${fileName}`;
        
        const response = await fetch(githubUrl);
        if (response.ok) {
          const xml = await response.text();
          return new Response(xml, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'max-age=3600',
              'Access-Control-Allow-Origin': '*'
            },
          });
        }
      } catch (error) {
        console.error('Error fetching XML file:', error);
      }
    }

    // List all available sitemaps from GitHub
    if (url.pathname === '/' || url.pathname === '') {
      try {
        // Fetch directory listing from GitHub API
        const apiUrl = 'https://api.github.com/repos/Victor1cnd/sitemaps/contents/sitemaps';
        const apiResponse = await fetch(apiUrl);
        
        if (apiResponse.ok) {
          const files = await apiResponse.json();
          const xmlFiles = files.filter(f => f.name.endsWith('.xml'));
          
          let html = `<!DOCTYPE html>
<html>
<head>
  <title>Sitemap Server</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f9f9f9; }
    h1 { color: #333; }
    .container { max-width: 800px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .file-list { list-style: none; padding: 0; }
    .file-item { margin: 10px 0; padding: 12px; background: #f5f5f5; border-left: 4px solid #0066cc; border-radius: 4px; }
    .file-item a { color: #0066cc; text-decoration: none; font-weight: bold; }
    .file-item a:hover { text-decoration: underline; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📍 Sitemap Server</h1>
    <p>Google bot discovery - Live XML sitemaps from GitHub repository</p>
    
    <h2>Available Sitemaps:</h2>
    <ul class="file-list">`;

          if (xmlFiles.length > 0) {
            xmlFiles.forEach(file => {
              html += `<li class="file-item">
                <a href="/${file.name}">${file.name}</a>
                <br><small style="color: #666;">Size: ${(file.size / 1024).toFixed(2)} KB</small>
              </li>`;
            });
          } else {
            html += `<li class="file-item">No XML files found in sitemaps directory</li>`;
          }

          html += `</ul>

    <div class="footer">
      <p><strong>How to use:</strong></p>
      <p>1. Edit XML files in <code>/sitemaps/</code> directory on <a href="https://github.com/Victor1cnd/sitemaps" target="_blank">GitHub</a></p>
      <p>2. Worker automatically fetches latest files from GitHub</p>
      <p>3. Submit sitemap URLs to Google Search Console</p>
      <p>4. Add new URLs daily without breaking the website</p>
    </div>
  </div>
</body>
</html>`;
          
          return new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
      } catch (error) {
        console.error('Error fetching file list:', error);
      }

      // Fallback HTML if API fails
      return new Response(`<!DOCTYPE html>
<html>
<head>
  <title>Sitemap Server</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
  </style>
</head>
<body>
  <h1>Sitemap Server Active</h1>
  <p>Visit <a href="https://github.com/Victor1cnd/sitemaps" target="_blank">GitHub repository</a> to add XML files to /sitemaps/</p>
</body>
</html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Sitemap Worker Active', { status: 200 });
  },
};
