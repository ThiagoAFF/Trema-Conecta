import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { createCrudService } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

const crud = createCrudService({ path: endpoints.notificacoes, demo: demo.notificacoes, mapper: mappers.notificacao });

export const notificacoesService = {
  list: crud.list,
  async contarNaoLidas() {
    const naoLidas = await crud.list({ lida: false });
    return naoLidas.length;
  },
  // Rotas A CONFIRMAR.
  async marcarComoLida(id) {
    if (env.DEMO_MODE) return demo.notificacoes.marcarComoLida(id);
    return http.patch(`${endpoints.notificacoes}/${id}/lida`, {});
  },
  async marcarTodasComoLidas() {
    if (env.DEMO_MODE) return demo.notificacoes.marcarTodasComoLidas();
    return http.post(`${endpoints.notificacoes}/marcar-todas-lidas`, {});
  },
};
