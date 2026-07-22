#!/usr/bin/env node
/**
 * Gera as variáveis de ambiente do login do admin.
 *
 *   npm run senha
 *
 * A senha em texto puro fica só no seu terminal: o que vai para o `.env` e para
 * o servidor é o hash, que não dá para reverter. Se você esquecer a senha, o
 * caminho é gerar outra — não existe "recuperar".
 */
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline";
import { promisify } from "node:util";

const derivar = promisify(scrypt);

/** Lê sem ecoar, para a senha não ficar no histórico visível do terminal. */
function perguntarSenha(pergunta) {
  return new Promise((resolve) => {
    const leitor = createInterface({ input: process.stdin, output: process.stdout });

    // `_writeToOutput` é a única forma de silenciar o eco no readline do Node.
    const escreverOriginal = leitor._writeToOutput.bind(leitor);
    leitor._writeToOutput = (texto) => {
      if (texto.includes(pergunta)) escreverOriginal(texto);
    };

    leitor.question(pergunta, (resposta) => {
      leitor.close();
      process.stdout.write("\n");
      resolve(resposta);
    });
  });
}

function perguntar(pergunta) {
  return new Promise((resolve) => {
    const leitor = createInterface({ input: process.stdin, output: process.stdout });
    leitor.question(pergunta, (resposta) => {
      leitor.close();
      resolve(resposta.trim());
    });
  });
}

const usuario = (await perguntar("Usuário do admin: ")) || "martim";

const senha = await perguntarSenha("Senha (não aparece enquanto você digita): ");
if (senha.length < 12) {
  console.error("\nSenha curta demais. Use pelo menos 12 caracteres.");
  process.exit(1);
}

const repetida = await perguntarSenha("Repita a senha: ");
if (senha !== repetida) {
  console.error("\nAs senhas não conferem.");
  process.exit(1);
}

const sal = randomBytes(16);
const chave = await derivar(senha, sal, 64);

console.log(`
Pronto. Cole estas três linhas no seu .env (local) e no .env do servidor:

ADMIN_USUARIO=${usuario}
ADMIN_SENHA_HASH=${sal.toString("hex")}:${chave.toString("hex")}
SESSION_SECRET=${randomBytes(32).toString("base64")}

O SESSION_SECRET acima é novo. Trocá-lo desconecta todas as sessões abertas —
o que é exatamente o que você quer se desconfiar que alguém entrou.
`);
