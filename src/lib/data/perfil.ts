export type TipoComercio =
  | "Varejo"
  | "Atacado"
  | "Restaurante / Alimentação"
  | "Bar / Cafeteria"
  | "Mercado / Supermercado"
  | "Padaria"
  | "Açougue"
  | "Beleza / Estética"
  | "Moda / Vestuário"
  | "Calçados / Acessórios"
  | "Pet Shop"
  | "Farmácia"
  | "Saúde / Clínica"
  | "Educação"
  | "Tecnologia / Eletrônicos"
  | "Construção / Materiais"
  | "Automotivo"
  | "Posto de Combustível"
  | "Serviços"
  | "Outro";

export const TIPOS_COMERCIO: TipoComercio[] = [
  "Varejo",
  "Atacado",
  "Restaurante / Alimentação",
  "Bar / Cafeteria",
  "Mercado / Supermercado",
  "Padaria",
  "Açougue",
  "Beleza / Estética",
  "Moda / Vestuário",
  "Calçados / Acessórios",
  "Pet Shop",
  "Farmácia",
  "Saúde / Clínica",
  "Educação",
  "Tecnologia / Eletrônicos",
  "Construção / Materiais",
  "Automotivo",
  "Posto de Combustível",
  "Serviços",
  "Outro",
];

export interface Perfil {
  nome: string;
  email: string;
  telefone: string;
  tipo_comercio: TipoComercio | "";
  foto?: string; // data URL ou URL externa
}

const STORAGE_KEY = "crescix:perfil";

export function getPerfil(): Perfil {
  if (typeof window === "undefined") return emptyPerfil();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyPerfil();
  try {
    return JSON.parse(raw) as Perfil;
  } catch {
    return emptyPerfil();
  }
}

export function setPerfil(perfil: Perfil): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
}

function emptyPerfil(): Perfil {
  return {
    nome: "",
    email: "",
    telefone: "",
    tipo_comercio: "",
    foto: undefined,
  };
}

/**
 * Extrai iniciais (2 letras) do nome para fallback de avatar.
 */
export function getIniciais(nome: string): string {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
