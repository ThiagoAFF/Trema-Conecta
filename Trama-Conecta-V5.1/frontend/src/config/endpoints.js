// Contratos HTTP do frontend inicial sincronizados com a API Spring Boot integrada.
// As rotas são encaminhadas pelo proxy do Vite no desenvolvimento.
export const endpoints = {
  auth: {
    login: '/auth/login',
    alterarSenha: '/auth/alterar-senha',
  },
  empresas: {
    cadastro: '/empresas/cadastro',
    atual: '/empresas/atual',
    preferencias: '/empresas/atual/preferencias-notificacoes',
  },
  clientes: '/clientes',
  pedidos: '/pedidos',
  lotes: '/lotes',
  movimentacoes: '/movimentacoes',
  usuarios: '/usuarios',
  notificacoes: '/notificacoes',
  dashboard: '/dashboard',
  relatorios: '/relatorios/resumo',
};
