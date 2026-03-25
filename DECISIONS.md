# DECISIONS.md — Decisões Arquiteturais

Este documento registra as decisões tomadas ao longo do projeto, com alternativas descartadas e o contexto de cada escolha.
Paradesenvolver de forma organizada, o projeto foi separado por etapas entregáveis, para poder avaliar o andamento do projeto.

---

## Etapa 1 — Estrutura Base

### Gerenciador de pacotes: pnpm workspaces

**Decisão:** pnpm com `pnpm-workspace.yaml`

**Alternativa descartada:** npm workspaces ou yarn workspaces

**Motivo do descarte:** pnpm tem melhor performance de instalação por usar hard links ao invés de duplicar pacotes no `node_modules`. Em um monorepo com dois apps compartilhando dependências como `react` e `react-dom`, isso reduz espaço em disco e tempo de CI. Yarn Classic tem problemas conhecidos com hoisting em monorepos. Yarn Berry (PnP) tem incompatibilidades com algumas ferramentas de bundling, incluindo casos documentados com Module Federation.

**Cenário onde a alternativa seria melhor:** npm workspaces seria preferível em times onde ninguém tem pnpm instalado e há restrição de instalar ferramentas globais adicionais — zero configuração extra para onboarding.

---

### Linting: ESLint flat config com typescript-eslint

**Decisão:** `eslint.config.js` na raiz com flat config (ESLint v9+)

**Alternativa descartada:** `.eslintrc.json` por app (config legacy)

**Motivo do descarte:** A flat config centraliza o lint no monorepo em um único arquivo, evitando configurações duplicadas e conflitantes entre `shell/` e `remote-workflow/`. O formato legacy `.eslintrc` está sendo depreciado pelo ESLint.

**Cenário onde a alternativa seria melhor:** Em projetos onde os apps têm regras muito diferentes entre si (ex: um app com React, outro com Node.js puro), configs separadas por app fariam mais sentido.

---

### Commits semânticos: commitlint + husky

**Decisão:** `@commitlint/config-conventional` com hook `commit-msg` via husky

**Alternativa descartada:** Apenas convenção de equipe sem enforcement automático

**Motivo do descarte:** Sem enforcement, commits fora do padrão entram no histórico e quebram ferramentas que dependem do formato para gerar changelogs automáticos. O hook garante que qualquer contribuidor seja bloqueado antes de commitar fora do padrão.

**Cenário onde a alternativa seria melhor:** Em projetos solo com prazo curtíssimo onde o overhead de configurar husky não vale o ganho, ou em repositórios onde o CI já valida isso no servidor.

---

### Hook pre-commit: pnpm lint

**Decisão:** rodar `pnpm lint` antes de cada commit

**Alternativa descartada:** `lint-staged` para lint apenas nos arquivos alterados

**Motivo do descarte neste momento:** O projeto está em fase inicial com poucos arquivos. `lint-staged` agrega valor real quando o projeto cresce e o lint começa a demorar. Adicionar agora seria complexidade prematura.

**Cenário onde a alternativa seria melhor:** Com o projeto maior, rodar ESLint em todo o codebase a cada commit se torna lento. `lint-staged` rodaria apenas nos arquivos do stage, mantendo o pre-commit ágil.

---

## Etapa 2 — Mock e Telas

### Estratégia de mock: MSW (Mock Service Worker)

**Decisão:** MSW com handlers por domínio + ativação condicional via `import()` dinâmico

**Alternativa descartada 1:** Fixtures estáticas importadas diretamente nos componentes

**Motivo do descarte:** Fixtures estáticas não permitem simular comportamentos dinâmicos como o 409 aleatório, estado mutável entre ações (aprovar um item e ele sumir da lista), ou erros condicionais. Além disso, o código de produção precisaria ter condicionais `if (import.meta.env.VITE_USE_MOCK)` espalhados em cada hook de dados — isso contamina o código de produção.

**Alternativa descartada 2:** Adapter pattern (interfaces de repositório com implementações mock e real)

**Motivo do descarte:** O adapter pattern resolve o problema de isolamento mas com mais boilerplate — para cada endpoint seria necessária uma interface, uma implementação real e uma mock. O MSW resolve isso de forma mais simples: o código de produção faz `fetch()` normalmente, e o MSW intercepta na camada de rede. A troca entre mock e produção é zero código no app.

**Cenário onde o adapter seria melhor:** Em projetos que precisam rodar testes unitários em Node.js (sem browser), onde o MSW exigiria configuração de `msw/node`. Ou quando o mock precisa de lógica de negócio complexa que vai além de simular respostas HTTP.

---

### Isolamento do mock do bundle de produção

O arquivo `remote-workflow/src/mocks/index.ts` usa import dinâmico:

```ts
export async function startMocks(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const { worker } = await import('./browser') // ← import dinâmico
  await worker.start()
}
```

Quando `VITE_USE_MOCK=false`, a condição curta-circuita antes do import. O Vite/Rollup detecta que o branch nunca é alcançado e elimina o import do bundle final via tree-shaking. O MSW, os handlers e os dados fake não aparecem no bundle de produção.

---

### Virtualização do inbox: @tanstack/react-virtual

**Decisão:** `@tanstack/react-virtual` com `useVirtualizer`

**Alternativa descartada:** `react-window` ou `react-virtualized`

**Motivo do descarte:** `react-window` e `react-virtualized` têm APIs mais antigas e menos flexíveis para itens de altura variável. O `@tanstack/react-virtual` é headless — não impõe nenhum estilo ou estrutura de DOM, o que facilita a integração com qualquer layout. É a lib mais ativa da categoria atualmente.

**Cenário onde a alternativa seria melhor:** `react-window` seria suficiente para listas com altura fixa e time sem familiaridade com a API do TanStack.

---

### Formulário dinâmico: react-hook-form + zod com schema gerado em runtime

**Decisão:** `buildZodSchema(fields)` gera o schema Zod a partir da definição de campos do template

**Alternativa descartada:** `yup` ou validação manual

**Motivo do descarte:** Zod tem inferência de tipos TypeScript nativa — o schema gerado já produz os tipos corretos sem declaração manual. Yup requer tipos separados. Validação manual seria código não-padrão difícil de manter quando os tipos de campo crescerem.

**Cenário onde a alternativa seria melhor:** Yup em projetos que já têm um ecossistema de validação consolidado com Yup e não vale o custo de migração.

---

### Troca de template sem remontar o formulário

**Decisão:** ao trocar o template, apenas atualizar o estado `selectedTemplate` sem usar `key={templateId}` no formulário

O `react-hook-form` mantém os valores registrados no store interno. Quando o template muda, os campos do novo template são renderizados com `register(field.name)`. Campos que existem nos dois templates (ex: `title`) preservam o valor preenchido automaticamente porque a chave do registro é o mesmo. Campos que não existem no novo template são desmontados do DOM mas o valor permanece no store interno do `react-hook-form` — não causa problema porque o Zod valida apenas os campos do schema atual.

**Sintoma visível se tivesse usado `key={templateId}`:** o formulário inteiro seria desmontado e remontado a cada troca de template. O usuário perderia todos os valores preenchidos, o foco seria resetado para o início da página, e campos em comum entre templates começariam vazios. Isso é o oposto do comportamento esperado pelo desafio.

---
