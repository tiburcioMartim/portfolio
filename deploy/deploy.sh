#!/usr/bin/env bash
#
# Publica o portfólio na VPS.
#
#   ./deploy/deploy.sh
#
# O site deixou de ser estático quando ganhou área administrativa: agora roda
# como processo Node atrás do nginx. O deploy monta um pacote fechado
# (`output: standalone`), manda por rsync para um diretório novo e só então
# aponta o `current` para ele e reinicia o serviço.
#
# Duas garantias que este script mantém, porque a VPS hospeda produção de
# cliente (loja da Celly, Saqua Local, Bússola Náutica):
#
#   1. O diretório de dados nunca é tocado. Seu conteúdo e suas fotos vivem em
#      `dados/`, fora de qualquer release — publicar não apaga o que você
#      escreveu pelo painel.
#   2. Antes e depois, conferimos que os sites dos clientes continuam de pé. Se
#      algum sair do ar, você fica sabendo agora e não na segunda-feira.

set -euo pipefail

# O endereço do servidor NÃO fica versionado: este repositório é público, e
# publicar o IP de uma máquina que hospeda produção de cliente — ainda por cima
# anunciando que ela aceita login como root — é entregar meio caminho andado a
# quem estiver varrendo a internet. Defina em `deploy/servidor.local` (ignorado
# pelo git) ou na variável de ambiente.
if [ -z "${SERVIDOR:-}" ] && [ -f "$(dirname "${BASH_SOURCE[0]}")/servidor.local" ]; then
  SERVIDOR="$(tr -d '[:space:]' < "$(dirname "${BASH_SOURCE[0]}")/servidor.local")"
fi

if [ -z "${SERVIDOR:-}" ]; then
  echo "Falta o servidor. Defina de uma das duas formas:" >&2
  echo "  echo 'usuario@endereco' > deploy/servidor.local" >&2
  echo "  SERVIDOR=usuario@endereco ./deploy/deploy.sh" >&2
  exit 1
fi

BASE="${BASE:-/var/www/martimtiburciodev}"
SERVICO="${SERVICO:-portfolio}"
DOMINIO="${DOMINIO:-martimtiburciodev.com.br}"

# Sites que já viviam na máquina. Não são nossos, e é justamente por isso que
# conferimos: um deploy do portfólio não tem o direito de encostar neles.
VIZINHOS=("saqualocal.com.br" "cellyarquivosdigitais.com.br")

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

RELEASE="$(date +%Y%m%d%H%M%S)"
DESTINO="$BASE/releases/$RELEASE"

conferir_vizinhos() {
  local momento="$1"
  echo "==> Conferindo os vizinhos ($momento)"
  for vizinho in "${VIZINHOS[@]}"; do
    local codigo
    codigo="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://$vizinho/" || echo "000")"
    printf '    %-32s HTTP %s\n' "$vizinho" "$codigo"
    if [ "$momento" = "depois" ] && [ "$codigo" != "200" ]; then
      echo "    ATENÇÃO: $vizinho não respondeu 200 depois do deploy." >&2
    fi
  done
}

conferir_vizinhos "antes"

echo "==> Lint e tipos"
npm run lint
npm run tipos

echo "==> Build de produção"
rm -rf .next
# `--webpack` porque o Turbopack ainda não gera `output: standalone`, que é o
# que permite publicar sem rodar `npm install` na VPS. Quando o Turbopack
# passar a gerar, dá para tirar esta flag e o resto continua igual.
npx next build --webpack

if [ ! -f .next/standalone/server.js ]; then
  echo "ERRO: o build não gerou .next/standalone/server.js — nada foi enviado." >&2
  exit 1
fi

echo "==> Montando o pacote"
# O standalone não copia estes dois por padrão; sem eles o site sobe sem CSS.
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public

# O Next criaria este diretório sozinho em runtime, mas o systemd precisa que
# ele já exista: `ReadWritePaths` monta um namespace na subida e falha com
# 226/NAMESPACE se o caminho não estiver lá. Custa um mkdir e evita um serviço
# que reinicia em laço sem explicar o motivo.
mkdir -p .next/standalone/.next/cache

echo "==> Enviando $(du -sh .next/standalone | cut -f1) para $DESTINO"
ssh "$SERVIDOR" "mkdir -p '$DESTINO' '$BASE/dados/conteudo' '$BASE/dados/uploads'"
rsync -az --delete --human-readable .next/standalone/ "$SERVIDOR:$DESTINO/"

echo "==> Ativando o release e reiniciando"
ssh "$SERVIDOR" bash -euo pipefail <<REMOTO
  # O dono precisa ser o usuário do serviço, senão o Node não lê o próprio código.
  chown -R portfolio:portfolio '$DESTINO' '$BASE/dados'

  # Troca atômica: o symlink novo é criado ao lado e renomeado por cima, então
  # não existe instante em que 'current' aponte para lugar nenhum.
  ln -sfn '$DESTINO' '$BASE/current.novo'
  mv -Tf '$BASE/current.novo' '$BASE/current'

  systemctl restart '$SERVICO'

  # Mantém os cinco últimos releases: espaço em disco é finito e voltar mais
  # que isso nunca aconteceu.
  cd '$BASE/releases'
  ls -1dt */ | tail -n +6 | xargs -r rm -rf
REMOTO

echo "==> Esperando o serviço responder"
for tentativa in $(seq 1 20); do
  codigo="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "https://$DOMINIO/" || echo "000")"
  if [ "$codigo" = "200" ]; then
    echo "    HTTP 200 na tentativa $tentativa"
    break
  fi
  if [ "$tentativa" = "20" ]; then
    echo "ERRO: o site não respondeu 200 depois de 20 tentativas (último: $codigo)." >&2
    echo "      Veja o que houve com: ssh $SERVIDOR journalctl -u $SERVICO -n 50" >&2
    exit 1
  fi
  sleep 2
done

echo "==> Conferindo o painel"
curl -sS -o /dev/null -w "    /admin/entrar    HTTP %{http_code}\n" "https://$DOMINIO/admin/entrar"

conferir_vizinhos "depois"

echo "==> Publicado: release $RELEASE"
