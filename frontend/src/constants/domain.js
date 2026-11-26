export const ETAPAS = [
  { value: 'corte', label: 'Corte' },
  { value: 'costura', label: 'Costura' },
  { value: 'acabamento', label: 'Acabamento' },
  { value: 'expedicao', label: 'Expedição' },
];
// O site de referência oferece "Concluído" como opção de etapa em lotes e movimentações.
export const ETAPAS_COM_CONCLUIDO = [...ETAPAS, { value: 'concluido', label: 'Concluído' }];

export const SITUACOES_PEDIDO = [
  { value: 'aguardando', label: 'Aguardando' },
  { value: 'em_producao', label: 'Em produção' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'atrasado', label: 'Atrasado' },
];
export const SITUACOES_LOTE = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'atrasado', label: 'Atrasado' },
  { value: 'concluido', label: 'Concluído' },
];
export const PERFIS = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
];
export const STATUS_USUARIO = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
export const UFS = UF_LIST.map((uf) => ({ value: uf, label: uf }));

export const PREFERENCIAS_NOTIFICACAO = [
  { key: 'mudancaEtapa', label: 'Mudança de etapa', description: 'Aviso quando um lote avançar para outra etapa.' },
  { key: 'loteConcluido', label: 'Lote concluído', description: 'Aviso quando um lote for finalizado.' },
  { key: 'prazoProximo', label: 'Prazo próximo', description: 'Aviso quando o prazo de um lote estiver chegando.' },
  { key: 'atraso', label: 'Atrasos', description: 'Aviso quando um pedido ou lote passar do prazo.' },
  { key: 'novaMovimentacao', label: 'Novas movimentações', description: 'Aviso a cada movimentação registrada.' },
];

// Rótulos de exibição para qualquer valor de domínio.
export const LABELS = Object.fromEntries(
  [...ETAPAS_COM_CONCLUIDO, ...SITUACOES_PEDIDO, ...SITUACOES_LOTE, ...PERFIS, ...STATUS_USUARIO].map((i) => [i.value, i.label]),
);

export const STATUS_TONE = {
  aguardando: 'neutral',
  em_producao: 'info',
  ativo: 'info',
  concluido: 'ok',
  atrasado: 'late',
  inativo: 'neutral',
  administrador: 'olive',
  funcionario: 'neutral',
};

export const ETAPA_COLORS = {
  corte: '#595817',
  costura: '#FAAA02',
  acabamento: '#DD6A0C',
  expedicao: '#101421',
  concluido: '#8a8a52',
};
