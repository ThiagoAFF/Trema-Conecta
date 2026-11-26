import { env } from '../config/env';
import { endpoints } from '../config/endpoints';
import { http } from './httpClient';
import { createCrudService, unwrapItem } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

const crud = createCrudService({ path: endpoints.usuarios, demo: demo.usuarios, mapper: mappers.usuario });

export const usuariosService = {
  ...crud,
  // Ativa ou desativa um usuário ('ativo' | 'inativo'). Rota A CONFIRMAR.
  async setStatus(id, status) {
    if (env.DEMO_MODE) return demo.usuarios.update(id, { status });
    return mappers.usuario.fromApi(unwrapItem(await http.patch(`${endpoints.usuarios}/${id}/status`, { status })));
  },
};
