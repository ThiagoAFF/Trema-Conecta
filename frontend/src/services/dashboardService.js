import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { unwrapItem } from './crudService';
import { demo } from './demo/demoStore';
import { pedidosService } from './pedidosService';
import { movimentacoesService } from './movimentacoesService';
import { notificacoesService } from './notificacoesService';

// indicadores: { clientes, pedidosEmAndamento, lotesAtivos, lotesAtrasados, lotesConcluidos,
//                lotesPorEtapa: [{ etapa, lotes, pecas }] }
async function getIndicadores() {
  if (env.DEMO_MODE) return demo.dashboard.indicadores();
  return unwrapItem(await http.get(endpoints.dashboard));
}

export const dashboardService = {
  async getResumo() {
    const [indicadores, pedidosRecentes, movimentacoesRecentes, notificacoes] = await Promise.all([
      getIndicadores(),
      pedidosService.list({ limit: 5 }),
      movimentacoesService.list({ limit: 5 }),
      notificacoesService.list({ lida: false, limit: 5 }),
    ]);
    return { indicadores, pedidosRecentes, movimentacoesRecentes, notificacoes };
  },
};
