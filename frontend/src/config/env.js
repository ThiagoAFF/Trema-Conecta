// Configuração central de ambiente. Nenhum outro arquivo lê import.meta.env diretamente.
const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const forceDemo = String(import.meta.env.VITE_DEMO_MODE ?? '').trim().toLowerCase() === 'true';

export const env = {
  API_URL,
  // Modo real é o padrão. Demonstração somente se VITE_DEMO_MODE=true.
  DEMO_MODE: forceDemo,
  HERO_IMAGE_URL:
    import.meta.env.VITE_HERO_IMAGE_URL ||
    'https://files.cdn-files-a.com/admin/system_photos_stock/800_6974c0f55e98c.jpg?format=avif',
};
