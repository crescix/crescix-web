"use client";

import { useParams } from "next/navigation";
import { OrcamentoForm } from "../../_components/orcamento-form";

export default function EditarOrcamentoPage() {
  const { id } = useParams<{ id: string }>();
  return <OrcamentoForm mode="editar" orcamentoId={id} />;
}
