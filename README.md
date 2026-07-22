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

**Push na `main` publica sozinho** (`.github/workflows/publicar.yml`): o runner
roda lint, tipos e build, empacota e entrega na VPS, que troca o release e
reinicia o serviço. Se o release novo não responder, o script do servidor volta
para o anterior em vez de deixar o site fora do ar.

Para publicar da própria máquina — útil se o GitHub estiver fora:

```bash
echo 'usuario@endereco' > deploy/servidor.local   # uma vez; fora do git
./deploy/deploy.sh
```

Em ambos, o diretório de dados nunca é tocado: o que você escreveu pelo painel
sobrevive a qualquer publicação.

### Por que a chave do GitHub não é perigosa

A VPS hospeda produção de cliente, então a chave guardada no GitHub **não abre
shell**. O `authorized_keys` do usuário `publicador` usa comando forçado:

```
command="/usr/local/bin/portfolio-receber-release",no-pty,... ssh-ed25519 AAAA…
```

Qualquer comando que o cliente peça é ignorado — só roda aquele script, que lê
o pacote da entrada padrão. E ele é dividido em dois de propósito
(`deploy/servidor/`):

- **`portfolio-receber-release`** roda como `publicador`, um usuário que não é
  dono de nada. É ele que extrai o pacote, porque conteúdo vindo da internet
  não deve ser desempacotado como root.
- **`portfolio-ativar`** é o único com `sudo`, e **não aceita argumento algum**:
  todo caminho é fixo. Script privilegiado que recebe parâmetro de quem está do
  outro lado da rede é convite.

O teto do estrago de um segredo vazado é publicar uma versão do próprio
portfólio — que roda como usuário sem privilégio, sem acesso a `/home` e sem
escrever fora da pasta de dados, por causa do endurecimento no systemd.

### Primeira vez num servidor novo

`deploy/preparar-servidor.sh` cria usuário, diretórios e segredos. O nginx é o
único passo manual — o arquivo do servidor tem o bloco HTTPS que o certbot
escreveu, e copiar o do repositório por cima derruba o HTTPS. A referência está
em `deploy/nginx/`.

## Capas automáticas

Projetos com capa em modo automático são fotografados e atualizados sozinhos.

```bash
npm install --no-save playwright && npx playwright install --with-deps chromium
SITE=https://martimtiburciodev.com.br CAPTURA_TOKEN=... npm run capturar
```

O agendamento semanal está em `.github/workflows/capas.yml` e precisa do
segredo `CAPTURA_TOKEN` no repositório. Só funciona para site público: sistema
atrás de login ou sem URL aberta recebe capa enviada à mão pelo painel.
