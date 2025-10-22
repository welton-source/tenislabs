const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4173;
const ROOT_DIR = path.resolve(__dirname, '..');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function resolveFilePath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath.split('?')[0]);
  const cleanedPath = decodedPath === '/' ? '/index.html' : decodedPath;
  const absolutePath = path.join(ROOT_DIR, cleanedPath);

  if (!absolutePath.startsWith(ROOT_DIR)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  let stats;

  try {
    stats = await fs.promises.stat(absolutePath);
  } catch (error) {
    if (!path.extname(cleanedPath)) {
      return path.join(ROOT_DIR, 'index.html');
    }

    throw Object.assign(error, { statusCode: error.code === 'ENOENT' ? 404 : 500 });
  }

  if (stats.isDirectory()) {
    return path.join(absolutePath, 'index.html');
  }

  return absolutePath;
}

async function serveFile(res, filePath, method) {
  try {
    const data = await fs.promises.readFile(filePath);

    if (method === 'HEAD') {
      res.writeHead(200, {
        'Content-Type': getMimeType(filePath),
        'Content-Length': Buffer.byteLength(data)
      });
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': getMimeType(filePath)
    });
    res.end(data);
  } catch (error) {
    const status = error.code === 'ENOENT' ? 404 : 500;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(status === 404 ? 'Arquivo não encontrado.' : 'Erro interno do servidor.');
  }
}

const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Método não permitido.');
    return;
  }

  try {
    const filePath = await resolveFilePath(req.url);
    await serveFile(res, filePath, req.method);
  } catch (error) {
    const status = error.statusCode || 500;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });

    if (status === 403) {
      res.end('Acesso negado.');
    } else if (status === 404) {
      res.end('Arquivo não encontrado.');
    } else {
      console.error('Erro ao atender requisição:', error);
      res.end('Erro interno do servidor.');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Servidor TenisLabs disponível em http://localhost:${PORT}`);
});
