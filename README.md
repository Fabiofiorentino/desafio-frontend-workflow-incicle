# Approval Workflow

SPA de workflow de aprovações para ambiente multiempresa, construída com React + TypeScript e arquitetura de microfrontends via Module Federation.

---

## Estrutura do Monorepo

```
approval-workflow/
  shell/              → app hospedeiro (React Router, autenticação, layout)
  remote-workflow/    → microfrontend exposto via Module Federation
  package.json        → raiz do workspace pnpm
  pnpm-workspace.yaml
```

---

## Setup Local

> Pré-requisitos: Node >= 18, pnpm instalado globalmente (`npm install -g pnpm`)

```bash
# 1. Clonar o repositório
git clone <url-do-repo>
cd approval-workflow

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp shell/.env.example shell/.env
cp remote-workflow/.env.example remote-workflow/.env

# 4. Rodar os dois apps
# Terminal 1
cd shell && pnpm dev

# Terminal 2
cd remote-workflow && pnpm dev
```

O shell roda em `http://localhost:5173` e o remote em `http://localhost:5174`.

**Tempo estimado do clone ao primeiro `pnpm dev`: ~3 minutos.**

---

## Variáveis de Ambiente

### shell/.env.example
```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true
VITE_APP_PORT=5173
VITE_REMOTE_WORKFLOW_URL=http://localhost:5174
```

### remote-workflow/.env.example
```
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK=true
VITE_APP_PORT=5174
```

> O arquivo `.env` nunca é commitado. Apenas o `.env.example` vai ao repositório.

---

## Estratégia de Mock

> Seção a ser preenchida na Etapa 2.

---

## Performance

> Seção a ser preenchida após o build de produção.

| Métrica | Meta | Medido |
|---|---|---|
| FCP (First Contentful Paint) | < 1,5s | — |
| Bundle inicial do shell | < 200 kB gzip | — |
| Bundle do remote | não incluso no shell inicial | — |
| Inbox com 10k itens | sem queda de FPS | — |

---

## Qualidade de Código

- TypeScript `strict: true` em ambos os apps
- ESLint configurado na raiz com `typescript-eslint` + `eslint-plugin-react-hooks`
- Commits semânticos obrigatórios via `commitlint` + `husky`
- `knip` para detecção de código morto (relatório em `KNIP-REPORT.md`)

---

## O que implementaria com mais tempo

> Seção a ser preenchida ao final do projeto.
