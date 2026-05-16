import { notFound } from "next/navigation";
import { orcamentosData } from "@/lib/data/orcamentos";
import { OrcamentoForm } from "../../_components/orcamento-form";

interface Props {
  params: { id: string };
}

export default function EditarOrcamentoPage({ params }: Props) {
  const orcamento = orcamentosData.find((o) => o.id === params.id);
  if (!orcamento) notFound();

  return (
    <OrcamentoForm
      mode="editar"
      orcamentoNumero={orcamento.numero}
      initialData={{
        cliente:        orcamento.cliente,
        validade:       orcamento.validade,
        status:         orcamento.status,
        itens:          orcamento.itens,
        observacoes:    orcamento.observacoes,
        desconto_geral: orcamento.desconto_geral,
      }}
    />
  );
}