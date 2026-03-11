// @ts-nocheck
import http from 'http';

const PORT = Number(process.env.PORT ?? 8080);

const server = http.createServer((req, res) => {
  if (req.url === '/api/creditbureau/aecb/consent/start' && req.method === 'POST') {
    res.statusCode = 501;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not implemented',
      message: 'AECB integration requires subscriber credentials and explicit customer consent flow.',
    }));
    return;
  }

  if (req.url === '/api/creditbureau/aecb/summary' && req.method === 'GET') {
    res.statusCode = 501;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({
      error: 'Not implemented',
      message: 'Return only minimum summary fields (e.g. total monthly instalments) after consent callback is completed.',
    }));
    return;
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
