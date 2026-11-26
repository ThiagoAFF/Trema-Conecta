import { endpoints } from '../config/endpoints';
import { createCrudService } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

// Movimentações são registros de histórico: o front-end só lista e cria (não edita nem apaga).
export const movimentacoesService = createCrudService({ path: endpoints.movimentacoes, demo: demo.movimentacoes, mapper: mappers.movimentacao });
