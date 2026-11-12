import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function localRepoCmsPlugin(): Plugin {
  return {
    name: 'local-repo-cms-plugin',
    configureServer(server) {
      server.middlewares.use('/api/local-cms/save', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const dataDir = path.resolve(__dirname, 'public/data');
            fs.mkdirSync(dataDir, {recursive: true});
            const targetPath = path.join(dataDir, 'portfolio-content.json');
            fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2), 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ok: true, savedTo: '/data/portfolio-content.json'}));
          } catch (err) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error: err instanceof Error ? err.message : 'Invalid JSON',
              })
            );
          }
        });
      });

      server.middlewares.use('/api/local-cms/upload-image', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const {fileName, dataUrl} = JSON.parse(body);
            const matches = String(dataUrl).match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (!matches) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ok: false, error: 'Invalid image dataUrl'}));
              return;
            }
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1].replace(/[^a-z0-9]/gi, '');
            const base64Data = matches[2];
            const safeBase = String(fileName || 'upload')
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '-')
              .slice(0, 48);
            const finalName = `${safeBase}-${Date.now()}.${ext || 'png'}`;
            const uploadDir = path.resolve(__dirname, 'public/images/uploads');
            fs.mkdirSync(uploadDir, {recursive: true});
            fs.writeFileSync(path.join(uploadDir, finalName), Buffer.from(base64Data, 'base64'));
            const publicPath = `/images/uploads/${finalName}`;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ok: true, path: publicPath}));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                ok: false,
                error: err instanceof Error ? err.message : 'Upload failed',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localRepoCmsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
