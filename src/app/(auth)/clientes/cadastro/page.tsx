"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { User, MapPin, Banknote, ChevronLeft, Save, X } from "lucide-react";
import Link from "next/link";

type FormState = {
  nome: string;
  tipoCpfCnpj: string;
  cpf: string;
  tipoPessoa: string;
  dataNascimento: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  cep: string;
  uf: string;
  logradouro: string;
  cidade: string;
  numero: string;
  complemento: string;
  bairro: string;
  cobrancaMesmoEndereco: string;
  email: string;
  dataCadastro: string;
  celular: string;
  status: string;
  telefoneFixo: string;
};

type Errors = Partial<Record<keyof FormState, string>>;
type SelectOption = { label: string; value: string };

const UF_OPTIONS: string[] = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO"
];

const CIDADES_POR_UF: Record<string, string[]> = {
  MG: ["Belo Horizonte","Uberlândia","Contagem","Juiz de Fora","Montes Claros","Ribeirão das Neves","Uberaba","Governador Valadares","Ipatinga"],
  SP: ["São Paulo","Guarulhos","Campinas","São Bernardo do Campo","Santo André","Osasco","Ribeirão Preto","Sorocaba","Santos"],
  RJ: ["Rio de Janeiro","São Gonçalo","Duque de Caxias","Nova Iguaçu","Niterói","Belford Roxo","Campos dos Goytacazes","Petrópolis"],
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "nome","tipoCpfCnpj","cpf","tipoPessoa","dataNascimento",
  "nomeFantasia","inscricaoEstadual","cep","uf","logradouro",
  "cidade","numero","complemento","bairro","cobrancaMesmoEndereco",
  "dataCadastro","celular","status",
];

// ─── Campo reutilizável ───────────────────────────────────────────────────────
function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all";

const selectClass =
  "w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer";

// ─── Seção ────────────────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CadastroCliente() {
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const initialForm: FormState = {
    nome: "", tipoCpfCnpj: "", cpf: "", tipoPessoa: "",
    dataNascimento: "", nomeFantasia: "", inscricaoEstadual: "",
    cep: "", uf: "", logradouro: "", cidade: "", numero: "",
    complemento: "", bairro: "", cobrancaMesmoEndereco: "",
    email: "", dataCadastro: hoje, celular: "", status: "ativo", telefoneFixo: "",
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [modal, setModal] = useState<boolean>(false);
  const [cidades, setCidades] = useState<string[]>([]);

  useEffect(() => {
    if (form.uf && CIDADES_POR_UF[form.uf]) {
      setCidades(CIDADES_POR_UF[form.uf]);
    } else {
      setCidades([]);
    }
    setForm((f) => ({ ...f, cidade: "" }));
  }, [form.uf]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (submitted) {
      setErrors((err) => ({ ...err, [name]: value ? "" : "Obrigatório" }));
    }
  }

  function validar(): Errors {
    const err: Errors = {};
    REQUIRED_FIELDS.forEach((field) => {
      if (!form[field]) err[field] = "Obrigatório";
    });
    return err;
  }

  function cadastrar() {
    setSubmitted(true);
    const err = validar();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    const clientes: FormState[] = JSON.parse(localStorage.getItem("clientes") || "[]");
    const novo = { id: Date.now(), ...form, telefone: form.celular };
    localStorage.setItem("clientes", JSON.stringify([...clientes, novo]));
    setModal(true);
    setSubmitted(false);
    setErrors({});
    setForm({ ...initialForm, dataCadastro: hoje });
  }

  return (
    <div className="min-h-screen w-full bg-transparent py-4">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Link
            href="/clientes"
            className="p-2 rounded-xl text-black hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Cadastro de Cliente
            </h1>
            <p className="text-lg text-gray-800 mt-0.5">
              Preencha os dados do novo cliente
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* DADOS DO CLIENTE */}
          <Section icon={User} title="Dados do Cliente" accent="bg-teal-50 text-teal-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Nome Completo" required error={errors.nome} className="md:col-span-2">
                <input
                  name="nome" value={form.nome} onChange={handleChange}
                  placeholder="Digite o nome completo"
                  className={`${inputClass} ${errors.nome ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Tipo CPF/CNPJ" required error={errors.tipoCpfCnpj}>
                <select
                  name="tipoCpfCnpj" value={form.tipoCpfCnpj} onChange={handleChange}
                  className={`${selectClass} ${errors.tipoCpfCnpj ? "border-rose-400" : ""}`}
                >
                  <option value="">Selecione...</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </Field>

              <Field label="Tipo de Pessoa" required error={errors.tipoPessoa}>
                <select
                  name="tipoPessoa" value={form.tipoPessoa} onChange={handleChange}
                  className={`${selectClass} ${errors.tipoPessoa ? "border-rose-400" : ""}`}
                >
                  <option value="">Selecione...</option>
                  <option value="fisica">Física</option>
                  <option value="juridica">Jurídica</option>
                </select>
              </Field>

              <Field label="CPF/CNPJ" required error={errors.cpf}>
                <input
                  name="cpf" value={form.cpf} onChange={handleChange}
                  placeholder="00.000.000/0000-00"
                  className={`${inputClass} ${errors.cpf ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Data de Nascimento" required error={errors.dataNascimento}>
                <input
                  name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange}
                  className={`${inputClass} ${errors.dataNascimento ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Nome Fantasia" required error={errors.nomeFantasia}>
                <input
                  name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange}
                  placeholder="Nome fantasia da empresa"
                  className={`${inputClass} ${errors.nomeFantasia ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Inscrição Estadual" required error={errors.inscricaoEstadual} className="md:col-span-2">
                <input
                  name="inscricaoEstadual" value={form.inscricaoEstadual} onChange={handleChange}
                  placeholder="Inscrição estadual"
                  className={`${inputClass} ${errors.inscricaoEstadual ? "border-rose-400" : ""}`}
                />
              </Field>

            </div>
          </Section>

          {/* ENDEREÇO */}
          <Section icon={MapPin} title="Endereço" accent="bg-blue-50 text-blue-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="CEP" required error={errors.cep}>
                <input
                  name="cep" value={form.cep} onChange={handleChange}
                  placeholder="00000-000"
                  className={`${inputClass} ${errors.cep ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="UF" required error={errors.uf}>
                <select
                  name="uf" value={form.uf} onChange={handleChange}
                  className={`${selectClass} ${errors.uf ? "border-rose-400" : ""}`}
                >
                  <option value="">Selecione...</option>
                  {UF_OPTIONS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>

              <Field label="Cidade" required error={errors.cidade} className="md:col-span-2">
                <select
                  name="cidade" value={form.cidade} onChange={handleChange}
                  className={`${selectClass} ${errors.cidade ? "border-rose-400" : ""}`}
                >
                  <option value="">Selecione a cidade...</option>
                  {cidades.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Logradouro" required error={errors.logradouro} className="md:col-span-2">
                <input
                  name="logradouro" value={form.logradouro} onChange={handleChange}
                  placeholder="Rua, Av, Logradouro..."
                  className={`${inputClass} ${errors.logradouro ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Bairro" required error={errors.bairro}>
                <input
                  name="bairro" value={form.bairro} onChange={handleChange}
                  placeholder="Nome do bairro"
                  className={`${inputClass} ${errors.bairro ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Número" required error={errors.numero}>
                <input
                  name="numero" value={form.numero} onChange={handleChange}
                  placeholder="Nº"
                  className={`${inputClass} ${errors.numero ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Complemento" required error={errors.complemento} className="md:col-span-2">
                <input
                  name="complemento" value={form.complemento} onChange={handleChange}
                  placeholder="Apto, Bloco, Sala..."
                  className={`${inputClass} ${errors.complemento ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Cobrança = Entrega?" required error={errors.cobrancaMesmoEndereco} className="md:col-span-2">
                <select
                  name="cobrancaMesmoEndereco" value={form.cobrancaMesmoEndereco} onChange={handleChange}
                  className={`${selectClass} ${errors.cobrancaMesmoEndereco ? "border-rose-400" : ""}`}
                >
                  <option value="">Selecione...</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </Field>

            </div>
          </Section>

          {/* DADOS DE CONTATO / FINANCEIROS */}
          <Section icon={Banknote} title="Contato e Dados Financeiros" accent="bg-emerald-50 text-emerald-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="E-mail" error={errors.email} className="md:col-span-2">
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="email@exemplo.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Celular / WhatsApp" required error={errors.celular}>
                <input
                  name="celular" value={form.celular} onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className={`${inputClass} ${errors.celular ? "border-rose-400" : ""}`}
                />
              </Field>

              <Field label="Telefone Fixo" error={errors.telefoneFixo}>
                <input
                  name="telefoneFixo" value={form.telefoneFixo} onChange={handleChange}
                  placeholder="(00) 0000-0000"
                  className={inputClass}
                />
              </Field>

              <Field label="Data de Cadastro" required>
                <input
                  name="dataCadastro" value={form.dataCadastro} readOnly
                  className={`${inputClass} bg-gray-50 text-gray-400 cursor-not-allowed`}
                />
                <span className="text-xs text-gray-400 mt-1 block">Preenchido automaticamente.</span>
              </Field>

              <Field label="Status" required>
                <select
                  name="status" value={form.status} onChange={handleChange}
                  className={selectClass}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </Field>

            </div>
          </Section>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/clientes">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-red-500 text-sm font-medium text-black bg-white hover:bg-red-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </Link>
            <button
              type="button"
              onClick={cadastrar}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Cadastrar Cliente
            </button>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Cliente cadastrado com sucesso!</h2>
            <button
              onClick={() => setModal(false)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl text-sm transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}