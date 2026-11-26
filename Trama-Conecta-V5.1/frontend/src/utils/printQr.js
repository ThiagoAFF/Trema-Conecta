const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Abre uma janela só com o QR Code do lote e dispara a impressão.
export function printQrCode(container, codigo) {
  const svg = container?.querySelector('svg');
  if (!svg) return false;
  const win = window.open('', '_blank', 'width=480,height=620');
  if (!win) return false;
  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>QR Code ${escapeHtml(codigo)}</title>
<style>body{font-family:Arial,sans-serif;text-align:center;padding:32px;color:#101421}h1{font-size:18px;margin:0 0 4px}p{margin:4px 0}svg{width:260px;height:260px;margin:20px 0}.c{font-size:22px;font-weight:700;letter-spacing:1px}</style></head>
<body><h1>Trama Conecta</h1><p>Lote</p>${svg.outerHTML}<p class="c">${escapeHtml(codigo)}</p></body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
  return true;
}
