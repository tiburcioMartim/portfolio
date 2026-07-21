#!/usr/bin/env bash
#
# Publica o portfólio na VPS.
#
#   ./deploy/deploy.sh
#
# O site é estático: o deploy é build local + rsync. Nenhum processo roda na
# VPS, então não há como este deploy afetar as aplicações que já vivem lá
# (saqualocal, loja da Celly). O --delete abaixo é restrito ao diretório de
# destino do portfólio.

set -euo pipefail

SERVIDOR="${SERVIDOR:-root@187.127.30.234}"
DESTINO="${DESTINO:-/var/www/martimtiburciodev/current}"
RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$RAIZ"

echo "==> Verificando tipos e lint"
npm run lint

echo "==> Build estático"
rm -rf out
npm run build

if [ ! -f out/index.html ]; then
  echo "ERRO: build não gerou out/index.html — nada foi enviado." >&2
  exit 1
fi

echo "==> Garantindo o diretório de destino em $SERVIDOR"
ssh "$SERVIDOR" "mkdir -p '$DESTINO'"

echo "==> Enviando $(du -sh out | cut -f1) para $DESTINO"
rsync -az --delete --human-readable \
  out/ "$SERVIDOR:$DESTINO/"

echo "==> Publicado. Conferindo resposta:"
curl -sS -o /dev/null -w "  HTTP %{http_code} em %{time_total}s\n" \
  https://martimtiburciodev.com.br/ || echo "  (ainda sem HTTPS ou DNS)"
