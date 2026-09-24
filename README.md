# Concept Builder

Marketplace B2B para empresas e fornecedores em Moçambique.

## Estado atual

A aplicação já inclui:

- Homepage com pesquisa e secção “O que precisa?”
- Diretório com filtros por sector, província e verificação
- Perfis individuais de empresas
- Login e registo de conta em modo demonstração
- Painel da empresa e edição de perfil
- Criação de pedidos e fornecedores compatíveis
- Convites e submissão de propostas
- Comparação de propostas
- Planos
- Português / English
- Navegação responsiva

Os dados desta primeira versão são demonstrativos e persistidos localmente no navegador. A integração com Supabase será feita numa fase seguinte.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

## Publicação

O projeto está configurado para **Vercel + TanStack Start**. O ficheiro `vercel.json` permite que a Vercel reconheça explicitamente o framework.

1. Entre na Vercel.
2. Importe o repositório `Cortex-inside/concept-builder`.
3. Mantenha a configuração de build detetada automaticamente.
4. Faça o deploy.

A Vercel criará uma URL pública e deployments de preview para os commits seguintes.

## Próxima fase

Depois de validar visualmente a aplicação publicada, avançaremos para a integração real de autenticação, empresas, pedidos e propostas com Supabase.
