import { lerArquivo } from "@/lib/arquivos";

/**
 * Serve as imagens enviadas pelo admin.
 *
 * Elas vivem fora da aplicação (para sobreviver a um deploy), então o `public/`
 * não dá conta e é preciso uma rota. Em produção o nginx intercepta `/uploads/`
 * e entrega o arquivo direto do disco; esta rota é o caminho de desenvolvimento
 * e a rede de segurança se aquela regra sair do lugar.
 */
export async function GET(
  _pedido: Request,
  contexto: { params: Promise<{ nome: string }> },
) {
  const { nome } = await contexto.params;

  const bytes = await lerArquivo(nome);
  if (!bytes) return new Response("Não encontrado", { status: 404 });

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/webp",
      // O nome carrega um sufixo aleatório e muda a cada novo envio, então o
      // conteúdo por trás de uma URL nunca muda.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
