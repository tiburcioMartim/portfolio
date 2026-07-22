#!/usr/bin/env bash
#
# Confere, depois de cada reinício, se tudo voltou.
#
# Instalado em /usr/local/bin/verificacao-pos-boot, disparado pelo serviço
# verificacao-pos-boot.service.
#
# Existe porque o reinício agora é automático e de madrugada: se a loja da
# Celly não subir às 4h da manhã, ninguém está acordado para perceber. Isto não
# substitui um monitoramento de verdade — mas garante que exista um registro
# claro do que voltou e do que não voltou, em vez de descobrir pelo cliente.
#
# Ver o resultado do último reinício:
#   journalctl -u verificacao-pos-boot -b

set -uo pipefail

SERVICOS=(nginx mysql php8.2-fpm php8.3-fpm supervisor portfolio fail2ban)
SITES=(saqualocal.com.br cellyarquivosdigitais.com.br bussolanautica.com.br martimtiburciodev.com.br)

PROBLEMAS=0

echo "Verificação pós-reinício — kernel $(uname -r)"

for servico in "${SERVICOS[@]}"; do
  systemctl list-unit-files "$servico.service" >/dev/null 2>&1 || continue

  estado="$(systemctl is-active "$servico" 2>&1)"
  if [ "$estado" = "active" ]; then
    echo "  ok      $servico"
  else
    echo "  FALHOU  $servico ($estado) — tentando subir"
    systemctl start "$servico" 2>/dev/null
    sleep 3
    if [ "$(systemctl is-active "$servico" 2>&1)" = "active" ]; then
      echo "  ok      $servico (subiu na segunda tentativa)"
    else
      echo "  PARADO  $servico — precisa de olho humano"
      PROBLEMAS=$((PROBLEMAS + 1))
    fi
  fi
done

# O nginx pode estar de pé e o site mesmo assim não responder — é a resposta
# HTTP que diz se o cliente consegue comprar, não o estado do processo.
for site in "${SITES[@]}"; do
  codigo="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "https://$site/" 2>/dev/null || echo "000")"
  if [ "$codigo" = "200" ]; then
    echo "  ok      https://$site"
  else
    echo "  FALHOU  https://$site respondeu $codigo"
    PROBLEMAS=$((PROBLEMAS + 1))
  fi
done

if [ "$PROBLEMAS" -eq 0 ]; then
  echo "Tudo voltou."
  exit 0
fi

echo "$PROBLEMAS item(ns) com problema depois do reinício."
exit 1
