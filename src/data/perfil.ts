export const perfil = {
  nome: "Martim Tiburcio",
  papel: "Desenvolvedor Full Stack",
  local: "Saquarema, RJ — presencial no Rio ou remoto",
  // Uma frase, sem jargão, que funciona para recrutador e para cliente.
  resumo:
    "Construo e modernizo sistemas web que sustentam operação real — de ERP hospitalar a loja com pagamento e entrega automática.",
  site: "https://martimtiburciodev.com.br",
  email: "tiburciomartim@gmail.com",
  linkedin: "https://www.linkedin.com/in/martimtiburcio-dev/",
  github: "https://github.com/tiburcioMartim",
} as const;

export const stack = [
  {
    grupo: "Backend",
    itens: ["PHP 8.3", "Laravel 12 / 13", "MySQL", "Filas e agendamento", "PHPUnit"],
  },
  {
    grupo: "Frontend",
    itens: ["Vue 3", "Inertia.js", "Livewire", "TypeScript", "Blade", "Tailwind CSS", "Alpine.js"],
  },
  {
    grupo: "Infra e entrega",
    itens: ["Docker", "GitHub Actions", "Nginx", "Deployer", "Cloudflare R2", "Vite"],
  },
  {
    grupo: "Integrações",
    itens: ["Mercado Pago", "Pagar.me", "Pix (EMV)", "WhatsApp", "Google Drive", "Web Push", "OAuth"],
  },
] as const;

/** Os três princípios que explicam *como* eu trabalho — a parte que diferencia. */
export const metodo = [
  {
    titulo: "O sistema que existe é a fonte de verdade",
    texto:
      "Antes de escrever qualquer linha numa migração, eu levanto o que o sistema antigo realmente faz: banco, permissões, integrações e as regras de negócio escondidas. Documento primeiro, migro depois. É por isso que dá para trocar a base sem parar a operação.",
  },
  {
    titulo: "IA acelera, quem decide sou eu",
    texto:
      "Uso agentes de IA no fluxo de desenvolvimento, mas dentro de um método que eu mesmo construí e publiquei: investigação obrigatória antes do código, e pontos de aprovação humana que não podem ser pulados. CI que barra o que não passa em lint e teste.",
  },
  {
    titulo: "Componente reusado é bug que não se repete",
    texto:
      "Em todo projeto eu construo um design system antes das telas. Trezentas telas com a mesma tabela, o mesmo filtro e o mesmo card significam um ajuste em um arquivo, não em trezentos.",
  },
] as const;

export const experiencia = [
  {
    cargo: "Desenvolvedor Full Stack Júnior",
    empresa: "Rede Hospital Casa",
    periodo: "mar/2026 — atual",
    local: "Rio de Janeiro · presencial",
    descricao:
      "Modernização do ERP que sustenta a operação da rede: migração de uma base legada em PHP para Laravel, com o sistema antigo em produção o tempo inteiro.",
  },
  {
    cargo: "Desenvolvedor — projetos próprios e para clientes",
    empresa: "Autônomo",
    periodo: "2025 — atual",
    local: "Remoto",
    descricao:
      "E-commerce de produtos digitais para cliente, portal comunitário e plataforma de ensino com assinatura. Do banco ao deploy, incluindo pagamento, LGPD e CI.",
  },
] as const;

export const formacao = [
  {
    curso: "Ciência da Computação",
    instituicao: "Descomplica Faculdade Digital",
    periodo: "jan/2026 — cursando",
  },
  {
    curso: "13 certificações técnicas",
    instituicao: "DIO e Descomplica",
    periodo: "Python, POO, Java e fundamentos de backend",
  },
] as const;
