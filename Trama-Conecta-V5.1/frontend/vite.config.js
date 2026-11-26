import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Mantém as URLs originais do frontend e encaminha as requisições ao Spring Boot.
const paths = ['/auth', '/empresas', '/clientes', '/pedidos', '/lotes',
  '/movimentacoes', '/usuarios', '/notificacoes', '/dashboard', '/relatorios'];
const apiPort = Number(process.env.TRAMA_API_PORT || 8080);
const frontPort = Number(process.env.TRAMA_FRONT_PORT || 5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: frontPort,
    strictPort: true,
    proxy: Object.fromEntries(paths.map((path) => [path, { target: `http://127.0.0.1:${apiPort}`, changeOrigin: true }])),
  },
});
