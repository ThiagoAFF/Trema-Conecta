# Notas de versão — Integração do frontend inicial

## Objetivo atendido
- Interface `frontend/` substituída pelo frontend inicial completo enviado pelo usuário.
- Mantidas as rotas e estrutura de componentes originais da interface, com adaptações pontuais para a API real.
- Backend Java/Spring Boot da V4.9 estendido por novos controllers, entidades, repositórios e migrations.

## Alterações de contrato
- Login: mantém a aparência do frontend inicial, mas usa **e-mail + senha** e resposta `accessToken`/JWT da V4.9.
- Cadastro de empresa: mapeia `razaoSocial` para `nomeEmpresa`, `responsavel` para administrador e conserva dados adicionais.
- Clientes: acrescenta documento, cidade, estado, observações e total de pedidos.
- Pedidos: mantém compatibilidade com a API V4.9 de múltiplos itens, mas a interface inicial só edita pedidos com um item.
- Lotes: código gerado pelo servidor, dados persistidos em `lotes` e QR Code exibido pelo frontend.
- Movimentações: dados persistidos em `movimentacoes`, atualização da etapa do lote e emissão de notificações conforme preferências.
- Usuários: senha inicial obrigatória, listagem e edição somente da empresa, alterações de status exigem administrador.
- Relatórios e dashboard: calculados a partir de dados reais no MySQL.
- Notificações: rastreio de movimentação e geração periódica de alertas de prazo.
- CSRF: frontend obtém token em `/auth/csrf` e o envia nos requests de alteração.

## Banco de dados
- Nova migration `V5__integracao_frontend_inicial.sql`, sem `DROP TABLE`.
- Não foram incluídas credenciais ou backups com dados privados.

## Verificações feitas
- Parser Java: 79 arquivos, zero erros sintáticos.
- Parser JS/JSX: 73 arquivos, zero erros sintáticos.
- Verificação estática de contratos executada com Node.
- Não houve compilação Maven, build Vite ou testes de integração com MySQL por falta de Java 25 e conectividade ao npm no ambiente de preparação.
