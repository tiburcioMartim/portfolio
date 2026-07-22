# Portfólio — Martim Tiburcio

Site pessoal de [Martim Tiburcio](https://www.linkedin.com/in/martimtiburcio-dev/), desenvolvedor full stack, com área administrativa própria.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · zod · jose · sharp

## Como rodar

```bash
npm install
npm run senha    # gera as credenciais do admin — cole a saída no .env
npm run dev      # http://localhost:3000  ·  painel em /admin
```

```bash
npm run build    # build de produção
npm run lint     # ESLint
npm run tipos    # TypeScript
```

O `.env` precisa de três variáveis, todas impressas pelo `npm run senha`:

```
ADMIN_USUARIO=...
ADMIN_SENHA_HASH=...      # scrypt; a senha em texto puro não é guardada
SESSION_SECRET=...        # trocar desconecta todas as sessões
```

Opcionais: `CONTEUDO_DIR` e `UPLOADS_DIR` (onde gravar; padrão `conteudo/`) e
`CAPTURA_TOKEN` (rotina de capas automáticas).

## Como o conteúdo funciona

Não há banco. O conteúdo são dois JSON num diretório de dados, e o admin os
reescreve de forma atômica.

```
src/data/seed/       ponto de partida, versionado no git
     ↓ (primeira execução, ou se o arquivo gravado sumir/corromper)
CONTEUDO_DIR/        estado vivo — fora da aplicação, sobrevive ao deploy
     ↑ admin grava    ↓ site lê
```

`src/data/schema.ts` é a fonte única: o mesmo schema zod que tipa o site valida
o que o admin grava.

```
src/
├── data/
│   ├── schema.ts       # schemas zod + tipos derivados
│   └── seed/           # conteúdo inicial (perfil.json, projetos.json)
├── lib/
│   ├── conteudo.ts     # leitura com fallback e escrita atômica
│   ├── arquivos.ts     # upload, otimização e caminho seguro das imagens
│   ├── token.ts        # assina/confere o JWT (serve ao proxy, roda no Edge)
│   ├── sessao.ts       # cookie de sessão
│   ├── credenciais.ts  # scrypt + comparação em tempo constante
│   ├── autorizacao.ts  # exigirSessao() — o portão que toda ação atravessa
│   └── limite.ts       # freio de força bruta no login
├── components/         # uma seção do site por arquivo
├── proxy.ts            # barra /admin (no Next 16, Middleware chama-se Proxy)
└── app/
    ├── admin/          # painel: perfil, fotos, projetos, capas
    ├── api/capas/      # recebe as capas capturadas automaticamente
    └── uploads/[nome]/ # serve as imagens enviadas
```

## Decisões

- **Deixou de ser estático porque ganhou login.** A versão anterior exportava
  HTML puro e o nginx servia arquivos. Autenticar exige alguém validando a senha
  no servidor, então hoje roda como processo Node. O que se perdeu foi a
  garantia de continuar no ar mesmo com tudo quebrado; o que se ganhou foi
  editar de qualquer lugar, sem publicar de novo.
- **Um usuário, sem banco.** A senha é um hash scrypt no ambiente e a sessão é
  um cookie assinado. Um banco de usuários para uma pessoa só seria peça a mais
  para manter e proteger.
- **Autorização colada no dado.** O `proxy.ts` redireciona quem não entrou, mas
  quem protege é o `exigirSessao()` no começo de cada página e ação. Server
  Actions são endpoints públicos: esconder o botão não esconde a ação.
- **Imagens otimizadas no envio, não na visita.** Chegam redimensionadas e em
  WebP. A VPS é compartilhada com produção de cliente e não deve gastar CPU
  refazendo a cada acesso o que já foi feito uma vez.
- **Capas capturadas fora da VPS.** Um navegador headless custa centenas de MB
  de RAM. A captura roda na sua máquina ou no runner do GitHub e chega por uma
  rota que só troca imagem de capa — nunca por SSH, para que um segredo vazado
  não vire acesso à máquina onde roda a loja da cliente.
- **Build com `--webpack`.** O Turbopack ainda não gera `output: standalone`, e
  é ele que permite publicar sem rodar `npm install` na VPS. Quando passar a
  gerar, basta tirar a flag do `deploy/deploy.sh`.
- **Tema no DOM, não no estado do React.** A classe do `<html>` é escrita por um
  script inline antes da primeira pintura, e o componente lê essa fonte única com
  `useSyncExternalStore` — sem flash e sem estado paralelo que possa divergir.
- **Contato por `mailto` com assunto preenchido.** O assunto já separa quem
  chega com vaga de quem chega com projeto.

## Publicar

```bash
./deploy/deploy.sh
```

Build local → pacote `standalone` → rsync para um release novo → troca o
symlink → reinicia o serviço. O diretório de dados nunca é tocado, e o script
confere antes e depois que os sites vizinhos na VPS continuam de pé.

Primeira vez: `deploy/preparar-servidor.sh` cria usuário, diretórios e
segredos. O nginx é o único passo manual — o arquivo do servidor tem o bloco
HTTPS que o certbot escreveu, e copiar o do repositório por cima derruba o
HTTPS. A referência está em `deploy/nginx/`.

## Capas automáticas

Projetos com capa em modo automático são fotografados e atualizados sozinhos.

```bash
npm install --no-save playwright && npx playwright install --with-deps chromium
SITE=https://martimtiburciodev.com.br CAPTURA_TOKEN=... npm run capturar
```

O agendamento semanal está em `.github/workflows/capas.yml` e precisa do
segredo `CAPTURA_TOKEN` no repositório. Só funciona para site público: sistema
atrás de login ou sem URL aberta recebe capa enviada à mão pelo painel.
