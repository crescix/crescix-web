/**
 * Máscaras de input para padrões brasileiros (CPF, CNPJ, telefone).
 *
 * Todas as funções são "idempotentes": podem ser chamadas em qualquer
 * estado intermediário do input (digitação progressiva, paste, etc.)
 * e produzem sempre o mesmo formato canônico.
 */

/**
 * CPF: 000.000.000-00 (11 dígitos)
 */
export function maskCPF(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * CNPJ: 00.000.000/0000-00 (14 dígitos)
 */
export function maskCNPJ(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/**
 * Telefone BR com country code: +55 (DD) XXXXX-XXXX (celular 11 dígitos)
 * ou +55 (DD) XXXX-XXXX (fixo 10 dígitos).
 *
 * Sempre normaliza para prefixo +55. Se o usuário digita só os 10/11
 * dígitos nacionais, o +55 é adicionado no display.
 */
export function maskPhone(value: string): string {
  // O input pode chegar com o proprio prefixo "+55" do display anterior.
  // Removemos esse prefixo ANTES de extrair digitos pra nao acabar
  // re-interpretando os "55" como digitos digitados pelo usuario.
  let raw = value;
  if (raw.startsWith("+55")) {
    raw = raw.slice(3);
  } else if (raw.startsWith("+")) {
    // "+" sozinho ou prefixo internacional incompleto — descarta o "+"
    // mas preserva os digitos seguintes.
    raw = raw.slice(1);
  }

  let d = raw.replace(/\D/g, "");

  // Se ainda assim sobrar um "55" inicial em paste de "5511..." (sem +),
  // remove quando o resto tem tamanho de numero nacional valido (10-11).
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    d = d.slice(2);
  }

  d = d.slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 2) return `+55 (${d}`;
  if (d.length <= 6) return `+55 (${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    // Fixo: XXXX-XXXX
    return `+55 (${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  // Celular: XXXXX-XXXX
  return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Retorna apenas os dígitos (útil pra enviar pro backend sem formatação).
 * Não usado por enquanto — salvamos com a máscara. Mas fica disponível.
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, "");
}
