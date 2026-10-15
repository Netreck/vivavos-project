import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Carrega variáveis de ambiente (.env ou .env.local) em modo de desenvolvimento
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

function devServerlessPlugin() {
  return {
    name: 'dev-serverless-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const endpoint = req.url.split('?')[0].replace('/api/', '');
          const handlerPath = path.resolve(process.cwd(), 'api', `${endpoint}.js`);

          if (fs.existsSync(handlerPath)) {
            try {
              // Parse JSON body se houver
              if (req.method === 'POST' || req.method === 'PUT') {
                const buffers = [];
                for await (const chunk of req) {
                  buffers.push(chunk);
                }
                const bodyStr = Buffer.concat(buffers).toString('utf-8');
                try {
                  req.body = bodyStr ? JSON.parse(bodyStr) : {};
                } catch {
                  req.body = bodyStr;
                }
              }

              // Mock helpers do Vercel/Express caso não existam
              res.status = (code) => {
                res.statusCode = code;
                return res;
              };
              res.json = (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return res;
              };

              // Importa dinamicamente o handler da função serverless
              const module = await server.ssrLoadModule(`/api/${endpoint}.js`);
              const handler = module.default || module;
              await handler(req, res);
              return;
            } catch (err) {
              console.error(`Erro ao executar /api/${endpoint}:`, err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: err.message || 'Erro interno no servidor de desenvolvimento' } }));
              return;
            }
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devServerlessPlugin()],
  server: {
    port: 5173,
    open: true,
  },
});
