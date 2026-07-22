import "server-only";

/**
 * Freio de força bruta no login.
 *
 * Mora na memória do processo porque só existe um processo. Reiniciar o serviço
 * zera a contagem, o que é aceitável: isto atrasa um ataque automatizado, e o
 * nginx faz o bloqueio mais grosso antes de a requisição chegar aqui.
 */

const JANELA_MS = 15 * 60 * 1000;
const TENTATIVAS_ATE_BLOQUEAR = 5;

type Registro = { tentativas: number; primeiraEm: number };

const registros = new Map<string, Registro>();

/** Remove janelas já vencidas para o Map não crescer sem limite. */
function limpar(agora: number): void {
  for (const [chave, registro] of registros) {
    if (agora - registro.primeiraEm > JANELA_MS) registros.delete(chave);
  }
}

export type Veredito = { permitido: true } | { permitido: false; segundosRestantes: number };

export function registrarTentativa(chave: string): Veredito {
  const agora = Date.now();
  limpar(agora);

  const registro = registros.get(chave);

  if (!registro || agora - registro.primeiraEm > JANELA_MS) {
    registros.set(chave, { tentativas: 1, primeiraEm: agora });
    return { permitido: true };
  }

  registro.tentativas += 1;

  if (registro.tentativas > TENTATIVAS_ATE_BLOQUEAR) {
    return {
      permitido: false,
      segundosRestantes: Math.ceil((JANELA_MS - (agora - registro.primeiraEm)) / 1000),
    };
  }

  return { permitido: true };
}

/** Chamado após um login bem-sucedido: acertar a senha limpa o histórico. */
export function esquecerTentativas(chave: string): void {
  registros.delete(chave);
}
