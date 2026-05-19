import * as z from "zod";

/**
 * Schema do formulário de fornecedor (cadastro e edição).
 *
 * Espelha o `fornecedorCreateSchema` da API (crescix-api). Lá, só 4 campos
 * são obrigatórios — todos os demais são opcionais. O formulário antigo
 * estava forçando 16 campos required no client-side por motivo errado;
 * agora segue o backend, e o que é opcional pra API é opcional no form.
 *
 * `type` espelha o enum `TipoFornecedor` do Prisma (COMERCIO/INDUSTRIA/
 * SERVICO em maiúsculo). A camada de display usa `FORNECEDOR_TYPE_LABEL`
 * de `@/lib/data/fornecedores` pra mostrar com acentuação.
 */
export const fornecedorSchema = z.object({
  // ── Obrigatórios (alinhados com fornecedorCreateSchema da API) ────────────
  razaoSocial: z.string().min(2, "Informe o nome da empresa"),
  cnpj: z.string().min(14, "CNPJ inválido"),
  endereco: z.string().min(2, "Informe o endereço"),
  type: z.enum(["COMERCIO", "INDUSTRIA", "SERVICO"], {
    message: "Selecione o tipo do fornecedor",
  }),

  // ── Opcionais (todos devem aceitar string vazia ou serem omitidos) ───────
  // O backend espera optional; aqui usamos `.optional().or(z.literal(""))`
  // pra que o input controlado com "" seja aceito sem erro.
  bairro: z.string().max(120).optional().or(z.literal("")),
  numero: z.string().max(20).optional().or(z.literal("")),
  ramoAtividade: z.string().max(120).optional().or(z.literal("")),
  nomeVendedor: z.string().max(120).optional().or(z.literal("")),
  whatsappVendedor: z.string().max(20).optional().or(z.literal("")),
  emailVendedor: z
    .string()
    .refine(
      (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "E-mail inválido"
    )
    .optional()
    .or(z.literal("")),
  // Aceita "www.exemplo.com", "exemplo.com.br" ou "https://exemplo.com".
  // `normalizeUrl()` adiciona https:// antes de enviar pro backend.
  siteCatalogo: z
    .string()
    .refine(
      (v) => v === "" || /^([a-z]+:\/\/)?[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i.test(v.trim()),
      "Endereço inválido (ex.: www.exemplo.com.br)"
    )
    .optional()
    .or(z.literal("")),
  chavePix: z.string().max(120).optional().or(z.literal("")),
  banco: z.string().max(80).optional().or(z.literal("")),
  agencia: z.string().max(20).optional().or(z.literal("")),
  conta: z.string().max(30).optional().or(z.literal("")),
  condicaoPagamento: z.string().max(120).optional().or(z.literal("")),
});

export type FornecedorFormData = z.infer<typeof fornecedorSchema>;
