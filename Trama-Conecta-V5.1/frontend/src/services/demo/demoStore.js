// MODO DEMONSTRAÇÃO — dados FICTÍCIOS em memória, ativado somente com VITE_DEMO_MODE=true.
// Nada aqui representa registros reais do banco de dados.
import { ApiError } from '../httpClient';
import { ETAPAS, LABELS } from '../../constants/domain';

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const norm = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pad = (n) => String(n).padStart(4, '0');
const sum = (rows, key) => rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);

let seq = 1000;
const nextId = () => String(++seq);

const ymd = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const at = (offsetDays, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const daysBetween = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));

const DEFAULT_PREFS = { mudancaEtapa: true, loteConcluido: true, prazoProximo: true, atraso: true, novaMovimentacao: false };

const mov = (id, loteId, etapa, responsavel, aprovadas, defeitos, observacoes, d, h) => ({
  id, loteId, etapa, responsavel, aprovadas, defeitos, observacoes, dataHora: at(d, h),
});

const db = {
  empresa: {
    id: '1', codigo: 'TRAMA2026', razaoSocial: 'Confecção Demonstração Ltda', cnpj: '11.222.333/0001-81',
    telefone: '(81) 99999-0000', cidade: 'Caruaru', estado: 'PE', responsavel: 'Responsável Demo',
    email: 'demo@tramaconecta.demo', preferencias: { ...DEFAULT_PREFS },
  },
  clientes: [
    { id: '1', nome: 'Boutique Capibaribe Ltda', documento: '12.345.678/0001-95', telefone: '(81) 3000-1001', cidade: 'Recife', estado: 'PE', email: 'compras@boutique.demo', observacoes: 'Cliente recorrente. Prefere entregas às quartas.' },
    { id: '2', nome: 'Moda Agreste Distribuidora', documento: '98.765.432/0001-98', telefone: '(81) 3000-1002', cidade: 'Caruaru', estado: 'PE', email: 'pedidos@modaagreste.demo', observacoes: '' },
    { id: '3', nome: 'Jeans & Cia Atacado', documento: '45.678.912/0001-55', telefone: '(81) 3000-1003', cidade: 'Toritama', estado: 'PE', email: 'atacado@jeanscia.demo', observacoes: 'Exige conferência peça a peça.' },
    { id: '4', nome: 'Rede Estilo Nordeste', documento: '33.444.555/0001-66', telefone: '(85) 3000-1004', cidade: 'Fortaleza', estado: 'CE', email: 'suprimentos@estilone.demo', observacoes: '' },
    { id: '5', nome: 'Maria das Neves Confecções', documento: '123.456.789-09', telefone: '(81) 99888-1005', cidade: 'Santa Cruz do Capibaribe', estado: 'PE', email: 'maria@neves.demo', observacoes: 'Pagamento antecipado.' },
  ],
  pedidos: [
    { id: '1', codigo: 'PED-0001', clienteId: '1', descricao: 'Camisas polo — coleção verão', quantidadePecas: 800, situacao: 'em_producao', dataRecebimento: ymd(-18), prazoEntrega: ymd(6) },
    { id: '2', codigo: 'PED-0002', clienteId: '2', descricao: 'Calças jeans masculinas', quantidadePecas: 1200, situacao: 'em_producao', dataRecebimento: ymd(-25), prazoEntrega: ymd(3) },
    { id: '3', codigo: 'PED-0003', clienteId: '3', descricao: 'Bermudas de sarja', quantidadePecas: 600, situacao: 'atrasado', dataRecebimento: ymd(-40), prazoEntrega: ymd(-4) },
    { id: '4', codigo: 'PED-0004', clienteId: '4', descricao: 'Vestidos casuais', quantidadePecas: 450, situacao: 'concluido', dataRecebimento: ymd(-50), prazoEntrega: ymd(-12) },
    { id: '5', codigo: 'PED-0005', clienteId: '5', descricao: 'Blusas de malha', quantidadePecas: 300, situacao: 'aguardando', dataRecebimento: ymd(-2), prazoEntrega: ymd(20) },
    { id: '6', codigo: 'PED-0006', clienteId: '1', descricao: 'Saias plissadas', quantidadePecas: 350, situacao: 'em_producao', dataRecebimento: ymd(-9), prazoEntrega: ymd(12) },
  ],
  lotes: [
    { id: '1', codigo: 'LOT-0001', pedidoId: '1', quantidadePecas: 400, etapaAtual: 'costura', dataInicio: ymd(-14), previsaoConclusao: ymd(4), situacao: 'ativo' },
    { id: '2', codigo: 'LOT-0002', pedidoId: '1', quantidadePecas: 400, etapaAtual: 'corte', dataInicio: ymd(-6), previsaoConclusao: ymd(6), situacao: 'ativo' },
    { id: '3', codigo: 'LOT-0003', pedidoId: '2', quantidadePecas: 700, etapaAtual: 'acabamento', dataInicio: ymd(-20), previsaoConclusao: ymd(2), situacao: 'ativo' },
    { id: '4', codigo: 'LOT-0004', pedidoId: '2', quantidadePecas: 500, etapaAtual: 'costura', dataInicio: ymd(-10), previsaoConclusao: ymd(3), situacao: 'ativo' },
    { id: '5', codigo: 'LOT-0005', pedidoId: '3', quantidadePecas: 600, etapaAtual: 'costura', dataInicio: ymd(-35), previsaoConclusao: ymd(-5), situacao: 'atrasado' },
    { id: '6', codigo: 'LOT-0006', pedidoId: '4', quantidadePecas: 450, etapaAtual: 'concluido', dataInicio: ymd(-48), previsaoConclusao: ymd(-14), situacao: 'concluido', dataConclusao: ymd(-12) },
    { id: '7', codigo: 'LOT-0007', pedidoId: '6', quantidadePecas: 350, etapaAtual: 'expedicao', dataInicio: ymd(-8), previsaoConclusao: ymd(1), situacao: 'ativo' },
  ],
  movimentacoes: [
    mov('1', '1', 'corte', 'Ana Souza', 400, 0, 'Corte concluído sem perdas.', -13, 9),
    mov('2', '1', 'costura', 'Carlos Lima', 190, 6, 'Parcial da costura.', -8, 15),
    mov('3', '2', 'corte', 'Ana Souza', 120, 3, 'Corte em andamento.', -2, 10),
    mov('4', '3', 'corte', 'Ana Souza', 700, 0, '', -19, 8),
    mov('5', '3', 'costura', 'Carlos Lima', 676, 24, 'Defeitos: costura aberta.', -11, 16),
    mov('6', '3', 'acabamento', 'Ana Souza', 300, 5, 'Acabamento iniciado.', -1, 11),
    mov('7', '4', 'corte', 'Ana Souza', 500, 0, '', -9, 9),
    mov('8', '4', 'costura', 'Carlos Lima', 210, 8, '', -3, 14),
    mov('9', '5', 'corte', 'Ana Souza', 600, 0, '', -34, 9),
    mov('10', '5', 'costura', 'Carlos Lima', 380, 22, 'Máquina parada por 2 dias.', -12, 10),
    mov('11', '6', 'expedicao', 'Ana Souza', 441, 9, 'Expedido ao cliente.', -13, 17),
    mov('12', '7', 'acabamento', 'Carlos Lima', 345, 5, '', -3, 13),
  ],
  notificacoes: [
    { id: '1', tipo: 'atraso', loteId: '5', descricao: 'O lote LOT-0005 passou da previsão de conclusão.', dataHora: at(-1, 8), lida: false },
    { id: '2', tipo: 'prazoProximo', loteId: '3', descricao: 'O prazo do lote LOT-0003 vence em 2 dias.', dataHora: at(0, 7), lida: false },
    { id: '3', tipo: 'mudancaEtapa', loteId: '7', descricao: 'O lote LOT-0007 avançou para a etapa Expedição.', dataHora: at(-1, 17), lida: false },
    { id: '4', tipo: 'novaMovimentacao', loteId: '4', descricao: 'Nova movimentação registrada no lote LOT-0004 (Costura).', dataHora: at(-3, 14), lida: true },
    { id: '5', tipo: 'loteConcluido', loteId: '6', descricao: 'O lote LOT-0006 foi concluído.', dataHora: at(-12, 17), lida: true },
  ],
  usuarios: [
    { id: '1', nome: 'Responsável Demo', email: 'demo@tramaconecta.demo', telefone: '(81) 99999-0000', perfil: 'administrador', status: 'ativo' },
    { id: '2', nome: 'Ana Souza', email: 'ana@tramaconecta.demo', telefone: '(81) 98888-0001', perfil: 'funcionario', status: 'ativo' },
    { id: '3', nome: 'Carlos Lima', email: 'carlos@tramaconecta.demo', telefone: '(81) 98888-0002', perfil: 'funcionario', status: 'inativo' },
  ],
};

const credenciais = new Map([['TRAMA2026', { senha: 'demo1234', empresa: db.empresa }]]);
const byId = (key, id) => db[key].find((r) => String(r.id) === String(id));
const publicEmpresa = ({ preferencias, ...rest }) => rest;

const enrichers = {
  clientes: (c) => ({ ...c, totalPedidos: db.pedidos.filter((p) => String(p.clienteId) === String(c.id)).length }),
  pedidos: (p) => ({ ...p, clienteNome: byId('clientes', p.clienteId)?.nome ?? '—', totalLotes: db.lotes.filter((l) => String(l.pedidoId) === String(p.id)).length }),
  lotes: (l) => {
    const p = byId('pedidos', l.pedidoId);
    return { ...l, pedidoCodigo: p?.codigo ?? '—', clienteNome: byId('clientes', p?.clienteId)?.nome ?? '—' };
  },
  movimentacoes: (m) => ({ ...m, loteCodigo: byId('lotes', m.loteId)?.codigo ?? '—' }),
  notificacoes: (n) => ({ ...n, loteCodigo: byId('lotes', n.loteId)?.codigo ?? '' }),
};

function addNotificacao({ tipo, loteId, descricao }) {
  db.notificacoes.push({ id: nextId(), tipo, loteId, descricao, dataHora: new Date().toISOString(), lida: false });
}

function makeCrud({ key, searchFields = [], prepareCreate = (d) => d, afterCreate, afterUpdate, sort }) {
  const enrich = enrichers[key] || ((x) => x);
  const defaultSort = (a, b) => Number(b.id) - Number(a.id);
  return {
    async list(params = {}) {
      await delay();
      const { search, limit, ...filters } = params;
      let rows = db[key].map(enrich);
      if (search) {
        const term = norm(search);
        rows = rows.filter((r) => searchFields.some((f) => norm(r[f]).includes(term)));
      }
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') rows = rows.filter((r) => String(r[k]) === String(v));
      });
      rows.sort(sort || defaultSort);
      return clone(limit ? rows.slice(0, Number(limit)) : rows);
    },
    async get(id) {
      await delay(120);
      const row = byId(key, id);
      if (!row) throw new ApiError('Registro não encontrado.', 404);
      return clone(enrich(row));
    },
    async create(data) {
      await delay();
      const row = { ...prepareCreate(data), id: nextId() };
      db[key].push(row);
      afterCreate?.(row);
      return clone(enrich(row));
    },
    async update(id, data) {
      await delay();
      const index = db[key].findIndex((r) => String(r.id) === String(id));
      if (index < 0) throw new ApiError('Registro não encontrado.', 404);
      db[key][index] = { ...db[key][index], ...data, id: db[key][index].id };
      afterUpdate?.(db[key][index]);
      return clone(enrich(db[key][index]));
    },
  };
}

const gerarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `TC-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
};

export const demo = {
  auth: {
    async login({ codigoEmpresa, senha }) {
      await delay(350);
      const entry = credenciais.get(String(codigoEmpresa || '').trim().toUpperCase());
      if (!entry || entry.senha !== senha) throw new ApiError('Código da empresa ou senha inválidos.', 401);
      db.empresa = entry.empresa;
      return {
        token: 'demo-token',
        empresa: clone(publicEmpresa(entry.empresa)),
        usuario: { id: '1', nome: entry.empresa.responsavel, email: entry.empresa.email, perfil: 'administrador' },
      };
    },
    async alterarSenha({ senhaAtual, novaSenha }) {
      await delay(400);
      const entry = [...credenciais.values()].find((e) => e.empresa === db.empresa);
      if (!entry || entry.senha !== senhaAtual) throw new ApiError('A senha atual está incorreta.', 400);
      entry.senha = novaSenha;
      return { ok: true };
    },
  },
  empresa: {
    async cadastrar(data) {
      await delay(500);
      const { senha, ...resto } = data;
      const codigo = gerarCodigo();
      const empresa = { id: nextId(), codigo, ...resto, preferencias: { ...DEFAULT_PREFS } };
      credenciais.set(codigo, { senha, empresa });
      return { codigo, empresa: clone(publicEmpresa(empresa)) };
    },
    async getAtual() {
      await delay(150);
      return clone(publicEmpresa(db.empresa));
    },
    async atualizar(data) {
      await delay();
      db.empresa = { ...db.empresa, ...data, id: db.empresa.id, codigo: db.empresa.codigo };
      const entry = [...credenciais.values()].find((e) => e.empresa.codigo === db.empresa.codigo);
      if (entry) entry.empresa = db.empresa;
      return clone(publicEmpresa(db.empresa));
    },
    async getPreferencias() {
      await delay(150);
      return { ...DEFAULT_PREFS, ...db.empresa.preferencias };
    },
    async salvarPreferencias(prefs) {
      await delay();
      db.empresa.preferencias = { ...prefs };
      return { ...prefs };
    },
  },
  clientes: makeCrud({ key: 'clientes', searchFields: ['nome', 'cidade', 'email', 'documento'] }),
  pedidos: makeCrud({
    key: 'pedidos',
    searchFields: ['codigo', 'clienteNome', 'descricao'],
    prepareCreate: (d) => ({ ...d, codigo: `PED-${pad(db.pedidos.length + 1)}` }),
  }),
  lotes: makeCrud({
    key: 'lotes',
    searchFields: ['codigo', 'pedidoCodigo', 'clienteNome'],
    prepareCreate: (d) => ({ ...d, codigo: `LOT-${pad(db.lotes.length + 1)}` }),
  }),
  movimentacoes: makeCrud({
    key: 'movimentacoes',
    searchFields: ['loteCodigo', 'responsavel', 'observacoes'],
    sort: (a, b) => new Date(b.dataHora) - new Date(a.dataHora),
    afterCreate: (m) => {
      const lote = byId('lotes', m.loteId);
      if (!lote) return;
      const mudou = lote.etapaAtual !== m.etapa;
      lote.etapaAtual = m.etapa;
      if (m.etapa === 'concluido') {
        lote.situacao = 'concluido';
        lote.dataConclusao = ymd(0);
      }
      if (m.etapa === 'concluido') addNotificacao({ tipo: 'loteConcluido', loteId: lote.id, descricao: `O lote ${lote.codigo} foi concluído.` });
      else if (mudou) addNotificacao({ tipo: 'mudancaEtapa', loteId: lote.id, descricao: `O lote ${lote.codigo} avançou para a etapa ${LABELS[m.etapa]}.` });
      else addNotificacao({ tipo: 'novaMovimentacao', loteId: lote.id, descricao: `Nova movimentação registrada no lote ${lote.codigo} (${LABELS[m.etapa]}).` });
    },
  }),
  usuarios: makeCrud({ key: 'usuarios', searchFields: ['nome', 'email'] }),
  notificacoes: {
    ...makeCrud({
      key: 'notificacoes',
      searchFields: ['descricao', 'loteCodigo'],
      sort: (a, b) => new Date(b.dataHora) - new Date(a.dataHora),
    }),
    async marcarComoLida(id) {
      await delay(120);
      const n = byId('notificacoes', id);
      if (n) n.lida = true;
      return { ok: true };
    },
    async marcarTodasComoLidas() {
      await delay(150);
      db.notificacoes.forEach((n) => { n.lida = true; });
      return { ok: true };
    },
  },
  dashboard: {
    async indicadores() {
      await delay();
      const { lotes, pedidos } = db;
      return {
        clientes: db.clientes.length,
        pedidosEmAndamento: pedidos.filter((p) => p.situacao !== 'concluido').length,
        lotesAtivos: lotes.filter((l) => l.situacao === 'ativo').length,
        lotesAtrasados: lotes.filter((l) => l.situacao === 'atrasado').length,
        lotesConcluidos: lotes.filter((l) => l.situacao === 'concluido').length,
        lotesPorEtapa: ETAPAS.map((e) => {
          const ls = lotes.filter((l) => l.situacao !== 'concluido' && l.etapaAtual === e.value);
          return { etapa: e.value, lotes: ls.length, pecas: sum(ls, 'quantidadePecas') };
        }),
      };
    },
  },
  relatorios: {
    async resumo() {
      await delay();
      const { lotes, movimentacoes } = db;
      const concluidos = lotes.filter((l) => l.situacao === 'concluido' && l.dataConclusao);
      const tempos = concluidos.map((l) => daysBetween(l.dataInicio, l.dataConclusao));
      return {
        pecasEmProducao: sum(lotes.filter((l) => l.situacao !== 'concluido'), 'quantidadePecas'),
        pecasAprovadas: sum(movimentacoes, 'aprovadas'),
        pecasDefeito: sum(movimentacoes, 'defeitos'),
        lotesConcluidos: lotes.filter((l) => l.situacao === 'concluido').length,
        lotesAtrasados: lotes.filter((l) => l.situacao === 'atrasado').length,
        tempoMedioDias: tempos.length ? Math.round((tempos.reduce((a, b) => a + b, 0) / tempos.length) * 10) / 10 : 0,
        producaoPorEtapa: ETAPAS.map((e) => ({
          etapa: e.value,
          pecas: movimentacoes.filter((m) => m.etapa === e.value).reduce((a, m) => a + Number(m.aprovadas) + Number(m.defeitos), 0),
        })),
        lotesPorEtapa: [...ETAPAS, { value: 'concluido' }].map((e) => ({ etapa: e.value, lotes: lotes.filter((l) => l.etapaAtual === e.value).length })),
      };
    },
  },
};
