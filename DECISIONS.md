# DECISIONS.md — Decisões Arquiteturais

Este documento registra as decisões tomadas ao longo do projeto, incluindo alternativas descartadas e o contexto de cada escolha.

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

**Motivo do descarte:** Sem enforcement, commits fora do padrão entram no histórico e quebram ferramentas que dependem do formato para gerar changelogs automáticos (ex: `semantic-release`). O hook garante que qualquer contribuidor — incluindo o próprio dev em momento de descuido — seja bloqueado antes de commitar errado.

**Cenário onde a alternativa seria melhor:** Em projetos solo com prazo curtíssimo onde o overhead de configurar husky não vale o ganho, ou em repositórios onde o CI já valida isso no servidor.

---

### Hook pre-commit: pnpm lint

**Decisão:** rodar `pnpm lint` antes de cada commit

**Alternativa descartada:** `lint-staged` para lint apenas nos arquivos alterados

**Motivo do descarte neste momento:** O projeto está em fase inicial com poucos arquivos. `lint-staged` agrega valor real quando o projeto cresce e o lint começa a demorar. Adicionar `lint-staged` agora seria complexidade prematura.

**Cenário onde a alternativa seria melhor:** Com o projeto maior, rodar ESLint em todo o codebase a cada commit se torna lento. `lint-staged` rodaria apenas nos arquivos do stage, mantendo o pre-commit ágil.

---

## Module Federation

> Seção a ser preenchida na Etapa 3.

**Perguntas obrigatórias a responder:**
- O que acontece, passo a passo, se o remote carrega com uma versão de `react` diferente da registrada como `requiredVersion` no shell?
- Se fosse necessário adicionar um segundo remote, o que mudaria na configuração atual?

---

## Estado e Conflito

> Seção a ser preenchida na Etapa 4.

**Perguntas obrigatórias a responder:**
- Qual o estado exato do store no momento em que um `approve` retorna 409 — antes, durante e após o rollback?
- Por que foi escolhida a estratégia X para multi-tab awareness e não Y?

---

## Formulário Dinâmico

> Seção a ser preenchida na Etapa 2/3.

**Pergunta obrigatória a responder:**
- Como foi garantido que a troca de template não remonta o formulário? Qual seria o sintoma visível com `key={templateId}`?
