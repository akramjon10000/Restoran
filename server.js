import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 80;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  let filePath = path.join(DIST, url);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  if (ext !== '.html') {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'no-cache');
  }

  const rawStream = fs.createReadStream(filePath);
  if (
    acceptEncoding.includes('gzip') &&
    (contentType.startsWith('text') ||
      contentType.includes('javascript') ||
      contentType.includes('json') ||
      contentType.includes('svg'))
  ) {
    res.setHeader('Content-Encoding', 'gzip');
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    rawStream.pipe(res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Restoran Voice AI App is running on http://0.0.0.0:${PORT}`);
});
