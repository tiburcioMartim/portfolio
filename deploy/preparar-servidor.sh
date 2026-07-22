#!/usr/bin/env bash
#
# Prepara a VPS para receber o portfólio. Roda UMA VEZ, como root, na VPS.
#
#   scp deploy/preparar-servidor.sh root@SERVIDOR:/tmp/
#   ssh root@SERVIDOR 'bash /tmp/preparar-servidor.sh'
#
# Faz só o que é seguro fazer sozinho: usuário, diretórios, segredos e o
# serviço. NÃO mexe no nginx — lá o certbot já escreveu configuração de HTTPS
# que um arquivo vindo do repositório apagaria. O passo do nginx fica no fim,
# como instrução para você aplicar à mão.

set -euo pipefail

BASE=/var/www/martimtiburciodev
ENV_FILE=/etc/portfolio.env

if [ "$(id -u)" -ne 0 ]; then
  echo "Rode como root." >&2
  exit 1
fi

echo "==> Conferindo o Node"
if ! command -v node >/dev/null 2>&1; then
  echo "ERRO: node não encontrado. Instale o Node 20+ antes de continuar." >&2
  exit 1
fi
node --version

echo "==> Usuário de serviço"
if id portfolio >/dev/null 2>&1; then
  echo "    já existe"
else
  # Sem shell e sem home: esta conta serve para rodar um processo, não para
  # alguém entrar nela.
  useradd --system --no-create-home --shell /usr/sbin/nologin portfolio
  echo "    criado"
fi

echo "==> Diretórios"
mkdir -p "$BASE/releases" "$BASE/dados/conteudo" "$BASE/dados/uploads"
chown -R portfolio:portfolio "$BASE/dados"
echo "    $BASE/dados é o único lugar onde o serviço escreve"

echo "==> Segredos"
if [ -f "$ENV_FILE" ]; then
  echo "    $ENV_FILE já existe — mantido como está"
else
  cat > "$ENV_FILE" <<EOF
# Preencha ADMIN_USUARIO e ADMIN_SENHA_HASH com o que o \`npm run senha\`
# imprimir na sua máquina, e então reinicie: systemctl restart portfolio
ADMIN_USUARIO=
ADMIN_SENHA_HASH=
SESSION_SECRET=$(head -c 32 /dev/urandom | base64)

# Usado pela rotina que atualiza as capas automáticas. Copie este valor para o
# segredo CAPTURA_TOKEN do repositório no GitHub.
CAPTURA_TOKEN=$(head -c 32 /dev/urandom | base64 | tr -d '/+=')

CONTEUDO_DIR=$BASE/dados/conteudo
UPLOADS_DIR=$BASE/dados/uploads
EOF
  # Só o root lê. O systemd carrega o arquivo antes de baixar privilégio, então
  # o serviço recebe as variáveis sem que o usuário `portfolio` possa abri-lo.
  chmod 600 "$ENV_FILE"
  chown root:root "$ENV_FILE"
  echo "    $ENV_FILE criado com um SESSION_SECRET novo"
fi

echo
echo "───────────────────────────────────────────────────────────────"
echo "Feito o que dava para fazer sozinho. Faltam três passos seus:"
echo
echo "1. Preencha o login em $ENV_FILE"
echo "     Rode \`npm run senha\` na sua máquina e cole as duas linhas"
echo "     ADMIN_USUARIO e ADMIN_SENHA_HASH aqui."
echo
echo "2. Instale o serviço"
echo "     cp portfolio.service /etc/systemd/system/"
echo "     systemctl daemon-reload && systemctl enable portfolio"
echo "     (ele só sobe depois do primeiro deploy, que cria o 'current')"
echo
echo "3. nginx — À MÃO, com cuidado"
echo "     O arquivo do servidor tem o bloco 443 que o certbot escreveu."
echo "     NÃO copie o do repositório por cima. Em vez disso:"
echo
echo "     cp /etc/nginx/sites-available/martimtiburciodev.com.br.conf \\"
echo "        /root/backup-nginx-portfolio-\$(date +%F).conf"
echo
echo "     Edite o arquivo trocando o bloco que serve arquivo estático"
echo "     (root + try_files) pelo proxy_pass da referência em"
echo "     deploy/nginx/, mantendo TUDO que o certbot pôs. Então:"
echo
echo "     nginx -t && systemctl reload nginx"
echo
echo "     Confira depois que saqualocal.com.br e cellyarquivosdigitais.com.br"
echo "     continuam respondendo 200."
echo "───────────────────────────────────────────────────────────────"
