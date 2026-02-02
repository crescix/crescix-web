export type FornecedorType = "Comércio" | "Indústria" | "Serviço";

export interface Fornecedor {
  id: string;
  razao_social: string;
  cnpj: string;
  endereco: string;
  type: FornecedorType;
}

export const fornecedoresData: Fornecedor[] = [
  {
    id: "1",
    razao_social: "Distribuidora Alimentos ABC",
    cnpj: "11.222.333/0001-44",
    endereco: "Rua das Flores, 123 - Centro",
    type: "Comércio",
  },
  {
    id: "2",
    razao_social: "Mercado Preço Bom Ltda.",
    cnpj: "55.666.777/0001-88",
    endereco: "Av. Principal, 987 - Bairro Novo",
    type: "Comércio",
  },
  {
    id: "3",
    razao_social: "Indústria de Embalagens ZYX",
    cnpj: "99.888.777/0001-66",
    endereco: "Rodovia Industrial, km 5",
    type: "Indústria",
  },
  {
    id: "4",
    razao_social: "Metalúrgica Ferro Forte",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua do Aço, 45 - Distrito Industrial",
    type: "Indústria",
  },
  {
    id: "5",
    razao_social: "LimpaTudo Serviços Gerais",
    cnpj: "12.345.678/0001-99",
    endereco: "Av. das Nações, 1000",
    type: "Serviço",
  },
  {
    id: "6",
    razao_social: "Tech Soluções TI",
    cnpj: "45.678.901/0001-23",
    endereco: "Rua da Inovação, 202 - Sala 4",
    type: "Serviço",
  },
];