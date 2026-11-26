/**
 * Same-origin proxy for the Java API on Render.
 * Browser calls /api/* on Cloudflare Pages; this function forwards requests
 * to the Render origin after removing /api.
 *
 * Configure Pages Functions runtime variable:
 * API_ORIGIN=https://YOUR-SERVICE.onrender.com
 */
export async function onRequest({ request, env }) {
  const source = new URL(request.url);
  if (!source.pathname.startsWith('/api/')) {
    return new Response('Not found', { status: 404 });
  }

  let origin;
  try {
    origin = new URL(env.API_ORIGIN || '');
  } catch {
    return new Response('API_ORIGIN nao configurada', { status: 503 });
  }
  if (origin.protocol !== 'https:' || origin.username || origin.password ||
      origin.search || origin.hash) {
    return new Response('API_ORIGIN invalida: use uma URL HTTPS', { status: 503 });
  }

  const endpoint = new URL(origin);
  endpoint.pathname = origin.pathname.replace(/\/$/, '') +
    source.pathname.slice('/api'.length);
  endpoint.search = source.search;

  try {
    const upstreamRequest = new Request(endpoint.toString(), request);
    const upstreamResponse = await fetch(upstreamRequest, { redirect: 'manual' });
    if (upstreamResponse.status >= 300 && upstreamResponse.status < 400) {
      return new Response('Redirecionamento da API nao permitido', { status: 502 });
    }
    const response = new Response(upstreamResponse.body, upstreamResponse);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  } catch {
    return new Response('A API esta iniciando ou indisponivel. Tente novamente.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }
}
