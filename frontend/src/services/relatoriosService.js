import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { unwrapItem } from './crudService';
import { demo } from './demo/demoStore';

// Resposta esperada:
// { pecasEmProducao, pecasAprovadas, pecasDefeito, lotesConcluidos, lotesAtrasados, tempoMedioDias,
//   producaoPorEtapa: [{ etapa, pecas }], lotesPorEtapa: [{ etapa, lotes }] }
export const relatoriosService = {
  async getResumo() {
    if (env.DEMO_MODE) return demo.relatorios.resumo();
    return unwrapItem(await http.get(endpoints.relatorios));
  },
};
