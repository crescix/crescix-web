import { api } from "./api/axios-config";
import type { UserProfile, TipoComercio } from "@/types/auth";

/**
 * Cliente do endpoint PATCH /auth/me. A API aceita atualização parcial
 * (qualquer combinação dos campos), e devolve o usuário completo já
 * atualizado. Use o retorno pra hidratar o estado do AuthContext.
 */
export interface UpdateMeInput {
  name?: string;
  phone?: string | null;
  tipoComercio?: TipoComercio | null;
  fotoUrl?: string | null;
  saldoInicial?: number;
}

export async function updateMe(input: UpdateMeInput): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/auth/me", input);
  return data;
}
