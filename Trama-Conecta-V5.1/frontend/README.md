# Frontend inicial do Trama Conecta — integrado

O frontend inicial do usuário substitui a interface da V4.9, preservando layout, componentes e páginas.

Para executar integrado ao backend da pasta `../api`:

```powershell
npm install
npm run dev
```

Acesse http://localhost:5173 e faça login **com e-mail e senha** de um usuário cadastrado.
A API Spring Boot deve estar funcionando na porta 8080. O proxy do Vite encaminha as URLs
`/auth`, `/empresas`, `/clientes`, `/pedidos`, `/usuarios`, `/lotes`, `/movimentacoes`,
`/notificacoes`, `/dashboard` e `/relatorios`.

O modo de demonstração é **opcional**: defina `VITE_DEMO_MODE=true` no arquivo `.env.local` e reinicie o Vite.
Dados de demonstração não são persistidos. A configuração padrão utiliza a API real.

Para detalhes de segurança, migrations, testes e compatibilidade, consulte `../README.md`.
