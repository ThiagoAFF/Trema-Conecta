# Responsividade — Trama Conecta V4.9

Esta atualização altera apenas o frontend, preservando o backend, o banco de dados e os endpoints.

## Mudanças realizadas

- Navegação administrativa em quatro abas para tablets e celulares.
- Cabeçalho de gestão reorganizado, com controles de tema, perfil e saída adaptáveis.
- Tabelas de clientes e pedidos convertidas visualmente em cartões para telas até 600 px, sem modificar as funções de edição, exclusão, cadastro e status.
- Filtros, indicadores, resumos, prazos e listas com dimensões flexíveis.
- Formulários de cadastro/login e modais ajustados a telas pequenas, inclusive em altura.
- Link "Criar empresa" adicionado ao menu de navegação móvel da página inicial.
- Campos de entrada com fonte adequada para evitar zoom automático em navegadores móveis.

Os estilos estão em `frontend/src/Responsive.css` e são carregados por `frontend/src/main.jsx`.

## Como executar

Backend: continue com o mesmo procedimento utilizado antes desta atualização.

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. Para checar a versão de produção do frontend:

```powershell
npm run build
```

## Checklist manual sugerido

No DevTools do navegador (`F12`, modo dispositivo), testar larguras de **320, 375, 390, 600, 768, 1024 e 1440 px**:

1. Página inicial: menu, cadastro de empresa, mapa, botões e cartões.
2. Login e cadastro: preenchimento e envio dos formulários.
3. Painel: navegação, indicadores, tema claro/escuro e sair.
4. Clientes: buscar, adicionar, editar e excluir; verificar cartões em mobile.
5. Pedidos: cadastrar, filtrar, consultar e alterar situação; verificar modais.
6. Prazos: filtros, cartões e textos longos.
7. Conferir a ausência de rolagem horizontal em páginas e formulários.

> A compilação não substitui uma validação visual e funcional no navegador com o backend em execução e dados reais.
