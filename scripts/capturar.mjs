#!/usr/bin/env node
/**
 * Fotografa os sites configurados como capa automática e envia o resultado
 * para o portfólio.
 *
 *   SITE=https://martimtiburciodev.com.br CAPTURA_TOKEN=... npm run capturar
 *
 * Roda na sua máquina ou no runner do GitHub — nunca na VPS, que hospeda
 * produção de cliente e não deveria gastar memória abrindo um Chromium.
 *
 * Precisa do Playwright, que NÃO é dependência do site (seria 300 MB no pacote
 * de deploy para nada). Instale só onde a captura roda:
 *
 *   npm install --no-save playwright && npx playwright install --with-deps chromium
 */

const SITE = process.env.SITE ?? "https://martimtiburciodev.com.br";
const TOKEN = process.env.CAPTURA_TOKEN;

if (!TOKEN) {
  console.error("Falta CAPTURA_TOKEN. É o mesmo valor que está no .env do servidor.");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "Playwright não encontrado. Instale com:\n" +
      "  npm install --no-save playwright && npx playwright install --with-deps chromium",
  );
  process.exit(1);
}

const cabecalhos = { Authorization: `Bearer ${TOKEN}` };

console.log(`Perguntando ao site o que fotografar (${SITE})`);
const resposta = await fetch(`${SITE}/api/capas`, { headers: cabecalhos });

if (!resposta.ok) {
  console.error(`O site respondeu ${resposta.status} ao pedir a lista.`);
  if (resposta.status === 401) console.error("Token errado ou ausente no servidor.");
  process.exit(1);
}

const { alvos } = await resposta.json();

if (alvos.length === 0) {
  console.log("Nenhum projeto está em modo automático. Nada a fazer.");
  process.exit(0);
}

const navegador = await chromium.launch();
// Viewport de notebook: é o enquadramento em que as pessoas realmente veem
// esses sistemas, e o recorte 16:9 do card cai bem em cima dele.
const contexto = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "pt-BR",
});

let falhas = 0;

for (const alvo of alvos) {
  process.stdout.write(`  ${alvo.slug.padEnd(20)} ${alvo.url} … `);

  const pagina = await contexto.newPage();

  try {
    await pagina.goto(alvo.url, { waitUntil: "networkidle", timeout: 45_000 });

    // Fonte e imagem que chegam atrasadas apareceriam como caixa vazia na
    // foto. Um respiro curto resolve o que o networkidle não pega.
    await pagina.waitForTimeout(2500);

    const imagem = await pagina.screenshot({ type: "png" });

    const formulario = new FormData();
    formulario.append("slug", alvo.slug);
    formulario.append("imagem", new Blob([imagem], { type: "image/png" }), `${alvo.slug}.png`);

    const envio = await fetch(`${SITE}/api/capas`, {
      method: "POST",
      headers: cabecalhos,
      body: formulario,
    });

    if (envio.ok) {
      console.log("ok");
    } else {
      const corpo = await envio.text();
      console.log(`falhou (${envio.status}: ${corpo.slice(0, 120)})`);
      falhas += 1;
    }
  } catch (erro) {
    console.log(`falhou (${erro.message.split("\n")[0]})`);
    falhas += 1;
  } finally {
    await pagina.close();
  }
}

await navegador.close();

// Um site fora do ar não deve derrubar a captura dos outros, mas o resultado
// precisa aparecer vermelho no GitHub para você ficar sabendo.
if (falhas > 0) {
  console.error(`\n${falhas} de ${alvos.length} falharam.`);
  process.exit(1);
}

console.log(`\n${alvos.length} capa(s) atualizada(s).`);
