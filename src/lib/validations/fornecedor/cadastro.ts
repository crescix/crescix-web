import * as z from "zod";

export const fornecedorSchema = z.object({
  // Dados da Empresa
  razaoSocial: z.string().min(3, "Razão Social deve ter no mínimo 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  ramoAtividade: z.string().min(1, "Selecione um ramo de atividade"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),

  // Dados do Representante
  nomeVendedor: z.string().min(3, "Nome do vendedor é obrigatório"),
  whatsappVendedor: z.string().min(10, "WhatsApp inválido"),
  emailVendedor: z.string().email("E-mail inválido"),
  siteCatalogo: z.string().url("URL inválida").optional().or(z.literal("")),

  // Dados Bancários
  chavePix: z.string().min(1, "Chave Pix é obrigatória"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  banco: z.string().min(1, "Banco é obrigatório"),
  conta: z.string().min(1, "Número da conta é obrigatório"),
  condicaoPagamento: z.string().min(1, "Condição de pagamento é obrigatória"),
});

export type FornecedorFormData = z.infer<typeof fornecedorSchema>;