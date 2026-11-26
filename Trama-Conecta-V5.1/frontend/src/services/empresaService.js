import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { demo } from './demo/demoStore';

export const empresaService = {
  async cadastrar(data) {
    if (env.DEMO_MODE) return demo.empresa.cadastrar(data);
    const res = await http.post(endpoints.empresas.cadastro, {
      nomeEmpresa: data.razaoSocial, cnpj: data.cnpj, emailEmpresa: data.email,
      telefoneEmpresa: data.telefone, nomeAdministrador: data.responsavel,
      emailAdministrador: data.email, senhaAdministrador: data.senha,
      cidade: data.cidade, estado: data.estado, responsavel: data.responsavel,
    });
    return { ...res, codigo: `EMP-${res.id}`, emailAdministrador: data.email };
  },
  async getAtual() {
    if (env.DEMO_MODE) return demo.empresa.getAtual();
    return http.get(endpoints.empresas.atual);
  },
  async atualizar(data) {
    if (env.DEMO_MODE) return demo.empresa.atualizar(data);
    return http.put(endpoints.empresas.atual, data);
  },
  async getPreferencias() {
    if (env.DEMO_MODE) return demo.empresa.getPreferencias();
    return http.get(endpoints.empresas.preferencias);
  },
  async salvarPreferencias(prefs) {
    if (env.DEMO_MODE) return demo.empresa.salvarPreferencias(prefs);
    return http.put(endpoints.empresas.preferencias, prefs);
  },
};
