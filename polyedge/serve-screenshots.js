const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = path.join('/home/openclaw-user/.openclaw/workspace/polyedge', 'dist');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.ico': 'image/x-icon', '.map': 'application/json'
};
http.createServer((req, res) => {
  let fp = path.join(dist, req.url === '/' ? 'index.html' : req.url);
  try {
    if (!fs.existsSync(fp)) fp = path.join(dist, 'index.html');
    const c = fs.readFileSync(fp);
    const ext = path.extname(fp);
    res.writeHead(200, {'Content-Type': MIME[ext]||'text/plain','Access-Control-Allow-Origin':'*'});
    res.end(c);
  } catch(e) { res.writeHead(404); res.end('404'); }
}).listen(3102, () => console.log('Serving on http://localhost:3102'));
