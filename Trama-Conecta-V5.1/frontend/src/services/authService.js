import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { demo } from './demo/demoStore';

export const authService = {
  // Resposta esperada: { token, empresa: {...}, usuario: {...} }
  async login({ codigoEmpresa, senha }) {
    if (env.DEMO_MODE) return demo.auth.login({ codigoEmpresa, senha });
    return http.post(endpoints.auth.login, { email: codigoEmpresa.trim().toLowerCase(), senha });
  },
  async logout() {
    if (!env.DEMO_MODE) return http.post('/auth/logout', {});
  },
  async alterarSenha({ senhaAtual, novaSenha }) {
    if (env.DEMO_MODE) return demo.auth.alterarSenha({ senhaAtual, novaSenha });
    return http.post(endpoints.auth.alterarSenha, { senhaAtual, novaSenha });
  },
};
