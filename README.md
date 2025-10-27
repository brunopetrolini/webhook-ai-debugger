# Webhook AI Debugger

Um debugger para webhooks com inteligência artificial.

## 🚀 Tecnologias

### API
- **Fastify** - Framework web rápido e de baixa sobrecarga
- **TypeScript** - Superset tipado de JavaScript
- **Drizzle ORM** - ORM TypeScript-first para PostgreSQL
- **Zod** - Validação de schemas TypeScript-first
- **PostgreSQL** - Banco de dados relacional
- **Docker** - Containerização de serviços
- **Biome** - Formatador e linter de código

### Web
- **React** - Biblioteca para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Vite** - Build tool e dev server

## 📦 Pré-requisitos

- Node.js 18+
- pnpm 10.17+
- Docker (para o banco de dados)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/brunopetrolini/webhook-ai-debugger.git
cd webhook-ai-debugger
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente na pasta `api`:
```bash
cd api
cp .env.example .env
```

4. Suba o banco de dados com Docker:
```bash
pnpm --filter @webhook-ai-debugger/api services:up
```

5. Execute as migrações do banco de dados:
```bash
pnpm --filter @webhook-ai-debugger/api db:migrate
```

## 🎯 Uso

### Desenvolvimento

Para iniciar o ambiente de desenvolvimento completo:

1. **API** (em um terminal):
```bash
pnpm --filter @webhook-ai-debugger/api dev
```

2. **Web** (em outro terminal):
```bash
pnpm --filter @webhook-ai-debugger/web dev
```

A API estará disponível em `http://localhost:3333` e a documentação em `http://localhost:3333/docs`.

O aplicativo web estará disponível em `http://localhost:5173`.

### Outros comandos úteis

**API:**
- `pnpm --filter @webhook-ai-debugger/api db:studio` - Abre o Drizzle Studio para visualizar o banco de dados
- `pnpm --filter @webhook-ai-debugger/api db:generate` - Gera novas migrações
- `pnpm --filter @webhook-ai-debugger/api format` - Formata o código

**Web:**
- `pnpm --filter @webhook-ai-debugger/web build` - Cria build de produção
- `pnpm --filter @webhook-ai-debugger/web preview` - Preview do build de produção

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
