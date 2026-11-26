import { endpoints } from '../config/endpoints';
import { createCrudService } from './crudService';
import { mappers } from './mappers';
import { demo } from './demo/demoStore';

export const lotesService = createCrudService({ path: endpoints.lotes, demo: demo.lotes, mapper: mappers.lote });
