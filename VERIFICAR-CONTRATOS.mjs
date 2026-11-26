import fs from 'node:fs';
import assert from 'node:assert/strict';
const text = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const endpoints=text('./frontend/src/config/endpoints.js');
const map={
  '/lotes':'LoteController.java',
  '/movimentacoes':'MovimentacaoController.java',
  '/notificacoes':'NotificacaoController.java',
  '/dashboard':'ResumoController.java',
  '/empresas/atual':'EmpresaGestaoController.java',
  '/pedidos':'PedidoController.java',
  '/usuarios':'UsuarioController.java',
};
for(const [route, controller] of Object.entries(map)) {
  assert.ok(endpoints.includes(route), `Sem endpoint no frontend: ${route}`);
  const body=text(`./api/src/main/java/br/com/conexaoteia/controller/${controller}`);
  assert.ok(body.includes('RequestMapping') || body.includes('GetMapping'), `Sem rota no controller: ${controller}`);
}
const migration=text('./api/src/main/resources/db/migration/V5__integracao_frontend_inicial.sql');
for(const table of ['lotes','movimentacoes','notificacoes','empresa_preferencias'])
  assert.ok(migration.includes(`CREATE TABLE ${table}`), `Sem tabela: ${table}`);
const cfg=text('./frontend/src/config/env.js');
assert.ok(cfg.includes('DEMO_MODE: forceDemo'), 'Modo de demonstração não deve ser ativado por padrão');
console.log('Estrutura e contratos essenciais presentes. Este teste não executa a aplicação.');
