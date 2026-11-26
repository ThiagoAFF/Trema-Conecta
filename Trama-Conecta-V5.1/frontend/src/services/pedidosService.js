import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { createCrudService, unwrapItem } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

const crud = createCrudService({ path: endpoints.pedidos, demo: demo.pedidos, mapper: mappers.pedido });

export const pedidosService = {
  ...crud,
  // Altera apenas a situação (ex.: marcar como concluído ou atrasado). Rota A CONFIRMAR.
  async setSituacao(id, situacao) {
    if (env.DEMO_MODE) return demo.pedidos.update(id, { situacao });
    return mappers.pedido.fromApi(unwrapItem(await http.patch(`${endpoints.pedidos}/${id}/situacao`, { situacao })));
  },
};
