# Desafio técnico InCicle - Approval Workflow

SPA de workflow de aprovações para ambiente multiempresa, construída com React + TypeScript e arquitetura de microfrontends via Module Federation.

---

## Estrutura do Monorepo

```
approval-workflow/
  shell/              → app hospedeiro (React Router, autenticação, layout)
  remote-workflow/    → microfrontend exposto via Module Federation
  package.json        → raiz do workspace pnpm
  pnpm-workspace.yaml
  README.md
  DECISIONS.md
```

---

## Setup Local

> Pré-requisitos: Node >= 18, pnpm instalado globalmente (`npm install -g pnpm`)

# 1. Clonar o repositório
```bash
git clone <url-do-repo>
cd approval-workflow
```
# 2. Instalar dependências
```bash
pnpm install
```

# 3. Configurar variáveis de ambiente
```bash
cp shell/.env.example shell/.env
cp remote-workflow/.env.example remote-workflow/.env
```

# 4. Rodar os dois apps
```bash
# Terminal 1
cd shell && pnpm dev

# Terminal 2
cd remote-workflow && pnpm dev
```

O shell roda em `http://localhost:5173` e o remote em `http://localhost:5174`.

---

# Telas

| Rota | Descrição |
|---|---|
| `/approvals/inbox` | Lista virtualizada de 10k aprovações pendentes com SLA em tempo real |
| `/instances/:id` | Detalhe com etapas (visual por status) e timeline cronológica |
| `/instances/new` | Formulário dinâmico gerado a partir do schema do template selecionado |
| `/delegations` | Listagem, criação e cancelamento de delegações com detecção visual de ciclo |

## Acessar as telas

[approvals/Inbox](http://localhost:5174/approvals/inbox)

[intances/:id](http://localhost:5174/instances/inst-1)

[instances/new](http://localhost:5174/instances/new)

[delegations](http://localhost:5174/delegations)

**Tempo estimado do clone ao primeiro `pnpm dev`: ~3 minutos.**

---

## Estratégia de Mock

O mock é feito com **MSW (Mock Service Worker)**. Ele intercepta requisições HTTP no nível do Service Worker do browser, sem modificar nenhum código de chamada de API.

### Estrutura dos mocks

```
remote-workflow/src/mocks/
  handlers/
    approvals.ts    → GET /api/approvals/inbox, POST approve/reject
    instances.ts    → GET /api/instances/:id, POST /api/instances
    templates.ts    → GET /api/templates (só publicados)
    delegations.ts  → GET/POST/DELETE /api/delegations
  data/
    approvals.ts    → 10.000 itens fake para demonstrar virtualização
    instances.ts    → instâncias com steps e timeline
    templates.ts    → templates com campos dinâmicos
    delegations.ts  → delegações ativas
  browser.ts        → registra todos os handlers no Service Worker
  index.ts          → ativa o mock apenas se VITE_USE_MOCK=true
```

### Comportamentos simulados no mock

| Endpoint | Comportamento especial |
|---|---|
| `POST /api/approvals/:id/approve` | Retorna `409 Conflict` em ~20% das chamadas |
| `POST /api/delegations` | Retorna `422` com cadeia de ciclo em ~20% das chamadas |
| `GET /api/templates` | Filtra apenas templates com `published: true` |

### Por que MSW e não fixtures estáticas?

Fixtures estáticas (JSON importado direto) não permitem simular comportamentos dinâmicos como o 409 aleatório, estado mutável entre ações, ou erros condicionais. O MSW intercepta no nível de rede — o código de produção faz `fetch()` normalmente, sem nenhuma condição `if (mock)` espalhada pelo código.

---

## Performance

> Métricas a serem medidas após o build de produção com `rollup-plugin-visualizer`.

| Métrica | Meta | Medido |
|---|---|---|
| FCP (First Contentful Paint) | < 1,5s | — |
| Bundle inicial do shell | < 200 kB gzip | — |
| Bundle do remote | não incluso no shell inicial | — |
| Inbox com 10k itens | sem queda de FPS | ✅ virtualizado com `@tanstack/react-virtual` |

---

## Qualidade de Código

- TypeScript `strict: true` em ambos os apps
- ESLint configurado na raiz com `typescript-eslint` + `eslint-plugin-react-hooks`
- Commits semânticos obrigatórios via `commitlint` + `husky`
- `knip` para detecção de código morto (relatório em `KNIP-REPORT.md`)

---


## Identidade Visual e Estilização

O projeto utiliza uma abordagem moderna de Atomic Design com foco em densidade de informações e performance, ideal para ferramentas corporativas de workflow.


### Stack de Estilo

- **Tailwind CSS v4.0**: Engine de estilos baseada em variáveis CSS nativas, garantindo um bundle extremamente reduzido e tempo de build ultra-rápido via Plugin do Vite.

- **Lucide React**: Biblioteca de ícones consistente para sinalização de status e ações.

- **Framer Motion / Tailwind Animate**: Micro-interações para feedbacks de estados (erro, sucesso e transições de lista).

### Decisões de Design (Design Tokens)

| Elemento | Estratégia  |    Justificativa     |
| ---------| --------------------| ------------------ |
| Paleta de Cores     | Slate & Indigo |    Tons de cinza escuro (slate-900) para a estrutura e Indigo para ações principais, reduzindo a fadiga visual.     |
| Status de SLA       | Semântica Visual | Cores críticas (red-400/500) para atrasos e alertas (amber-400) para proximidade de vencimento. |

