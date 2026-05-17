import * as z from "zod";

/**
 * Schema do formulário de fornecedor (cadastro e edição).
 *
 * Os valores de `type` espelham o enum `TipoFornecedor` do Prisma
 * (COMERCIO/INDUSTRIA/SERVICO em maiúsculo). A camada de display
 * usa `FORNECEDOR_TYPE_LABEL` de `@/lib/data/fornecedores` para
 * mostrar com acentuação ("Comércio", etc.).
 */
export const fornecedorSchema = z.object({
  // Dados da Empresa
  razaoSocial: z.string().min(3, "Razão Social deve ter no mínimo 3 caracteres"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  endereco: z.string().min(5, "Endereço completo é obrigatório"),
  type: z.enum(["COMERCIO", "INDUSTRIA", "SERVICO"], {
    message: "Selecione o tipo do fornecedor",
  }),
  ramoAtividade: z.string().min(1, "Selecione um ramo de atividade"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),

  // Dados do Representante
  nomeVendedor: z.string().min(3, "Nome do vendedor é obrigatório"),
  whatsappVendedor: z.string().min(10, "WhatsApp inválido"),
  emailVendedor: z.string().email("E-mail inválido"),
  // Aceita "www.exemplo.com", "exemplo.com.br" ou "https://exemplo.com".
  // Antes de enviar pro backend, normalizeUrl() adiciona https:// se faltar.
  siteCatalogo: z
    .string()
    .refine(
      (v) => v === "" || /^([a-z]+:\/\/)?[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(v.trim()),
      "Informe um endereço válido (ex.: www.exemplo.com.br)"
    )
    .optional()
    .or(z.literal("")),

  // Dados Bancários
  chavePix: z.string().min(1, "Chave Pix é obrigatória"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  banco: z.string().min(1, "Banco é obrigatório"),
  conta: z.string().min(1, "Número da conta é obrigatório"),
  condicaoPagamento: z.string().min(1, "Condição de pagamento é obrigatória"),
});

export type FornecedorFormData = z.infer<typeof fornecedorSchema>;
