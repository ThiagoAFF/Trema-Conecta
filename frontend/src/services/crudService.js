import { env } from '../config/env';
import { http } from './httpClient';

// Aceita respostas em array ou embrulhadas ({ data | items | content | resultados }).
export const unwrapList = (res) => (Array.isArray(res) ? res : res?.data ?? res?.items ?? res?.content ?? res?.resultados ?? []);
export const unwrapItem = (res) => (res && !Array.isArray(res) && res.data && typeof res.data === 'object' ? res.data : res);

const identity = (value) => value;

export function createCrudService({ path, demo, mapper = {} }) {
  const fromApi = mapper.fromApi || identity;
  const toApi = mapper.toApi || identity;
  return {
    async list(params = {}) {
      if (env.DEMO_MODE) return demo.list(params);
      const rows = unwrapList(await http.get(path)).map(fromApi);
      const norm = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const { search, limit, ...filters } = params;
      let result = rows;
      if (search) result = result.filter((row) => Object.values(row).some((value) => norm(value).includes(norm(search))));
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '')
          result = result.filter((row) => String(row[key]) === String(value));
      }
      return limit ? result.slice(0, Number(limit)) : result;
    },
    async get(id) {
      if (env.DEMO_MODE) return demo.get(id);
      return fromApi(unwrapItem(await http.get(`${path}/${id}`)));
    },
    async create(data) {
      if (env.DEMO_MODE) return demo.create(data);
      return fromApi(unwrapItem(await http.post(path, toApi(data))));
    },
    async update(id, data) {
      if (env.DEMO_MODE) return demo.update(id, data);
      return fromApi(unwrapItem(await http.put(`${path}/${id}`, toApi(data))));
    },
  };
}
