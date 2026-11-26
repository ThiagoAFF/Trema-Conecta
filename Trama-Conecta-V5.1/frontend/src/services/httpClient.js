import { env } from '../config/env';
import { authStorage, UNAUTHORIZED_EVENT } from './authStorage';

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}
const STATUS_MESSAGES = {
  400: 'Os dados enviados são inválidos.', 401: 'Sessão expirada. Faça login novamente.',
  403: 'Acesso negado ou token CSRF inválido.', 404: 'Registro não encontrado.',
  409: 'Registro já existe ou está vinculado a outros dados.',
  422: 'Dados inválidos.', 500: 'Erro interno do servidor.',
};

async function request(method, path, { params, body } = {}) {
  const url = new URL(env.API_URL + path, window.location.origin);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = authStorage.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  // A API usa CookieCsrfTokenRepository; o token lido do endpoint é enviado no header.
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !['/auth/login', '/empresas/cadastro'].includes(path)) {
    const csrfResponse = await fetch(new URL(env.API_URL + '/auth/csrf', window.location.origin), {
      credentials: 'same-origin', headers: { Accept: 'application/json' },
    });
    if (!csrfResponse.ok) throw new ApiError('Não foi possível obter o token CSRF.', csrfResponse.status);
    const csrf = await csrfResponse.json();
    headers[csrf.headerName || 'X-XSRF-TOKEN'] = csrf.token;
  }
  let response;
  try {
    response = await fetch(url, {
      method, headers, credentials: 'same-origin',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Falha de conexão com a API. Confirme se o backend está ativo.', 0);
  }
  const isJson = (response.headers.get('content-type') || '').includes('application/json');
  const data = response.status === 204 ? null : isJson ? await response.json().catch(() => null) : null;
  if (!response.ok) {
    if (response.status === 401 && token) {
      authStorage.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(data?.mensagem || data?.message || data?.erro || STATUS_MESSAGES[response.status] ||
      `Requisição falhou (${response.status}).`, response.status, data);
  }
  return data;
}
export const http = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};
