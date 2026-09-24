# Concept Builder

Marketplace B2B para empresas e fornecedores em Moçambique.

## Arquitetura de produção

A aplicação é uma **aplicação Vercel + TanStack Start + Supabase**. O deploy e os previews são independentes do Lovable.

- Frontend e SSR: Vercel / TanStack Start
- Autenticação, dados, RLS e Storage: Supabase
- Variáveis públicas do browser: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`
- Variáveis de servidor: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e, quando necessário, `SUPABASE_SERVICE_ROLE_KEY`
- A chave `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta ao browser nem receber o prefixo `VITE_`.

### Migração do Lovable

O código-fonte já não depende de autenticação, storage, preview broker, OAuth ou telemetria do Lovable. Os deployments devem apontar para o **projeto Supabase original que contém as contas e dados existentes**.

**Não crie um novo projeto Supabase para resolver perda de acesso.** Antes de alterar dados ou criar utilizadores, confirme que as variáveis da Vercel apontam para o projeto Supabase original.

No histórico do repositório, o projeto Supabase original usado antes da migração foi identificado pelo ref `jfopluuddyiyqgalghpk`. O projeto atualmente acessível nesta ligação de ferramentas é outro projeto e não contém utilizadores. Use o projeto original apenas se ele estiver disponível na conta/organização Supabase correta.

Na Vercel, configure para Production, Preview e Development as variáveis correspondentes ao projeto original. Depois faça um novo deployment para que o browser e o runtime SSR usem a mesma instância Supabase.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

Verificação de tipos:

```bash
npm run typecheck
```

## Publicação

O projeto está configurado para **Vercel + TanStack Start**. O ficheiro `vercel.json` identifica explicitamente o framework.

1. Importe o repositório `Cortex-inside/concept-builder` na Vercel.
2. Mantenha a configuração de build detetada automaticamente.
3. Configure as variáveis Supabase do projeto original em todos os ambientes necessários.
4. Faça o deploy.
5. Valide login, registo, sessão, dashboard e consultas protegidas.

A Vercel criará uma URL pública e deployments de preview para os commits seguintes.

## Estado funcional

A aplicação inclui:

- Homepage com pesquisa e secção “O que precisa?”
- Diretório com filtros por sector, província e verificação
- Perfis individuais de empresas
- Autenticação Supabase
- Painel da empresa e edição de perfil
- Criação de pedidos e fornecedores compatíveis
- Convites e submissão de propostas
- Comparação de propostas
- Planos
- Português / English
- Navegação responsiva
- Documentação de concursos com acesso livre/pago e fluxo de aprovação
