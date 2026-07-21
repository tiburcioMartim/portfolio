# Portfólio — Martim Tiburcio

Site pessoal de [Martim Tiburcio](https://www.linkedin.com/in/martimtiburcio-dev/), desenvolvedor full stack.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## Como rodar

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # build de produção
npm run lint    # ESLint
```

## Organização

O conteúdo está separado da apresentação, para que atualizar um projeto ou um
número não exija tocar em componente algum:

```
src/
├── data/
│   ├── perfil.ts       # dados pessoais, stack, método, experiência
│   └── projetos.ts     # os projetos exibidos, com números e stack
├── components/         # uma seção por arquivo
└── app/
    ├── layout.tsx      # metadados, fontes e script anti-flash do tema
    ├── page.tsx        # composição das seções
    └── globals.css     # tokens de tema (claro/escuro) e utilitários
```

## Decisões

- **Página estática.** Todo o conteúdo é conhecido em tempo de build; não há
  motivo para renderizar no servidor a cada visita.
- **Tema no DOM, não no estado do React.** A classe do `<html>` é escrita por um
  script inline antes da primeira pintura, e o componente lê essa fonte única com
  `useSyncExternalStore` — sem flash e sem estado paralelo que possa divergir.
- **Contato por `mailto` com assunto preenchido.** Um formulário exigiria backend
  ou serviço de terceiro; o assunto já separa quem chega com vaga de quem chega
  com projeto.
