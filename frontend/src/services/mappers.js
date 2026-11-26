// Os nomes exibidos no frontend inicial são preservados; a API mantém os contratos V4.9.
const identity = (x) => x;
const pair = { fromApi: identity, toApi: identity };
export const mappers = {
  cliente: pair,
  pedido: {
    fromApi: identity,
    toApi: (p) => ({
      clienteId: Number(p.clienteId), prazoEntrega: p.prazoEntrega,
      dataRecebimento: p.dataRecebimento, situacao: p.situacao,
      observacoes: null,
      itens: [{ descricao: p.descricao, quantidade: Number(p.quantidadePecas) }],
      // Também é utilizado no PUT /pedidos/{id} (contrato simplificado).
      descricao: p.descricao, quantidadePecas: Number(p.quantidadePecas),
    }),
  },
  lote: pair,
  movimentacao: pair,
  usuario: pair,
  notificacao: pair,
  empresa: pair,
};
