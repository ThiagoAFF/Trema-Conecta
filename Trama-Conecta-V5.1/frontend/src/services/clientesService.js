import { endpoints } from '../config/endpoints';
import { createCrudService } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

export const clientesService = createCrudService({ path: endpoints.clientes, demo: demo.clientes, mapper: mappers.cliente });
