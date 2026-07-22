import FormularioDePerfil from "./FormularioDePerfil";
import GerenciadorDeFoto from "./GerenciadorDeFoto";
import { Bloco } from "@/components/admin/campos";
import { exigirSessao } from "@/lib/autorizacao";
import { lerPerfil } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

export default async function EditarPerfil() {
  await exigirSessao();

  const documento = await lerPerfil();

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Conteúdo</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Perfil e fotos</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Tudo aqui alimenta o site e também os metadados — trocar o resumo muda o texto que o
          LinkedIn mostra quando alguém compartilha o link.
        </p>
      </div>

      {/* As fotos ficam fora do formulário de texto porque têm outro ciclo:
          enviar já grava, sem esperar o "salvar" do resto da página. */}
      <Bloco
        titulo="Suas fotos"
        descricao="São enviadas na hora e já entram redimensionadas e otimizadas."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <GerenciadorDeFoto
            posicao="retrato"
            titulo="Retrato do topo"
            descricao="Aparece ao lado do seu nome, na primeira dobra. Vertical funciona melhor."
            arquivo={documento.perfil.fotos.retrato}
            proporcao="4 / 5"
          />
          <GerenciadorDeFoto
            posicao="metodo"
            titulo="Foto do método"
            descricao="Acompanha a seção 'como trabalho'. Algo mais informal, na horizontal."
            arquivo={documento.perfil.fotos.metodo}
            proporcao="4 / 3"
          />
        </div>
      </Bloco>

      <FormularioDePerfil inicial={documento} />
    </div>
  );
}
