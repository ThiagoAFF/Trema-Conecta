# Alterações — Trama Conecta V5.1 / Trama-App

Base: projeto **Trama-Conecta-Integrado-Frontend-Inicial-V5.zip** fornecido na conversa.

## Adicionado
- `Trama-App.ps1`: inicializador Windows 11 PowerShell 5.1+.
- `Trama-App.sh`: inicializador Linux Bash.
- `docs/TRAMA-APP.md`: uso, parâmetros, segurança, diagnósticos e limites.

## Atualizado
- `frontend/vite.config.js`: proxy e portas de desenvolvimento passam a usar `TRAMA_API_PORT` e `TRAMA_FRONT_PORT` se definidos, mantendo defaults 8080/5173.
- `.gitignore`: exclui `.trama-app/` para impedir commits de chaves, configurações locais e logs.
- `README.md`: instruções de inicialização pelo Trama-App.

## Removido
- `api/teia-start.ps1`: substituído por `Trama-App.ps1` na raiz.

## Não alterado
- Entidades Java, serviços, controllers, DTOs, migrations SQL e dados do banco.
- Código React funcional (páginas, componentes, serviços e lógica de autenticação).

## Testes executados nesta entrega
- `bash -n Trama-App.sh`: sintaxe válida.
- `node --check frontend/vite.config.js`: sintaxe válida.
- Teste integrado simulado do script Linux com servidores locais substitutos: pré-verificação, inicialização sequencial, verificação HTTP, geração da chave e encerramento dos processos, todos funcionando.

**Pendente:** executar e validar o PowerShell em um Windows 11 real; validar ambos os scripts com Java 25, Spring Boot, Vite e MySQL verdadeiros. O ambiente de edição tem Java 21 e não possui PowerShell. Este pacote não comprova que as migrations V5 e os testes de negócio passarão em seu banco existente.
