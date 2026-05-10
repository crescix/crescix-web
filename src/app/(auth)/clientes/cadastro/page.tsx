"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { User, MapPin, Banknote, ChevronLeft, Save, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type FormState = {
  nome: string; tipoCpfCnpj: string; cpf: string; tipoPessoa: string;
  dataNascimento: string; nomeFantasia: string; inscricaoEstadual: string;
  cep: string; uf: string; logradouro: string; cidade: string; numero: string;
  complemento: string; bairro: string; cobrancaMesmoEndereco: string;
  email: string; dataCadastro: string; celular: string; status: string; telefoneFixo: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const UF_OPTIONS: string[] = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const CIDADES_POR_UF: Record<string, string[]> = {
  MG: ["Belo Horizonte","Uberlândia","Contagem","Juiz de Fora","Montes Claros","Ribeirão das Neves","Uberaba","Governador Valadares","Ipatinga"],
  SP: ["São Paulo","Guarulhos","Campinas","São Bernardo do Campo","Santo André","Osasco","Ribeirão Preto","Sorocaba","Santos"],
  RJ: ["Rio de Janeiro","São Gonçalo","Duque de Caxias","Nova Iguaçu","Niterói","Belford Roxo","Campos dos Goytacazes","Petrópolis"],
};

const REQUIRED_FIELDS: (keyof FormState)[] = [
  "nome","tipoCpfCnpj","cpf","tipoPessoa","dataNascimento","nomeFantasia",
  "inscricaoEstadual","cep","uf","logradouro","cidade","numero","complemento",
  "bairro","cobrancaMesmoEndereco","dataCadastro","celular","status",
];

function Field({ label, required, error, children, className = "" }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all";
const inputErrorClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-red-400/50 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-red-400 transition-all";
const selectClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer";
const selectErrorClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-red-400/50 rounded-xl text-white focus:outline-none focus:border-red-400 transition-all cursor-pointer";

function Section({ icon: Icon, title, number, children }: {
  icon: React.ElementType; title: string; number: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-white/50" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function CadastroCliente() {
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const initialForm: FormState = {
    nome: "", tipoCpfCnpj: "", cpf: "", tipoPessoa: "", dataNascimento: "",
    nomeFantasia: "", inscricaoEstadual: "", cep: "", uf: "", logradouro: "",
    cidade: "", numero: "", complemento: "", bairro: "", cobrancaMesmoEndereco: "",
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
    if (submitted) setErrors((err) => ({ ...err, [name]: value ? "" : "Obrigatório" }));
  }

  function validar(): Errors {
    const err: Errors = {};
    REQUIRED_FIELDS.forEach((field) => { if (!form[field]) err[field] = "Obrigatório"; });
    return err;
  }

  function cadastrar() {
    setSubmitted(true);
    const err = validar();
    if (Object.keys(err).length > 0) { setErrors(err); return; }
    const clientes: FormState[] = JSON.parse(localStorage.getItem("clientes") || "[]");
    const novo = { id: Date.now(), ...form, telefone: form.celular };
    localStorage.setItem("clientes", JSON.stringify([...clientes, novo]));
    setModal(true);
    setSubmitted(false);
    setErrors({});
    setForm({ ...initialForm, dataCadastro: hoje });
  }

  return (
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/clientes" className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
              Cadastros / Clientes
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Cadastro de Cliente
            </h1>
          </div>
        </div>

        <div className="space-y-5">

          {/* DADOS DO CLIENTE */}
          <Section icon={User} title="Dados do Cliente" number={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Nome Completo" required error={errors.nome} className="md:col-span-2">
                <input name="nome" value={form.nome} onChange={handleChange} placeholder="Digite o nome completo"
                  className={errors.nome ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Tipo CPF/CNPJ" required error={errors.tipoCpfCnpj}>
                <select name="tipoCpfCnpj" value={form.tipoCpfCnpj} onChange={handleChange}
                  className={errors.tipoCpfCnpj ? selectErrorClass : selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  <option value="cpf" className="bg-[#0f2f52]">CPF</option>
                  <option value="cnpj" className="bg-[#0f2f52]">CNPJ</option>
                </select>
              </Field>

              <Field label="Tipo de Pessoa" required error={errors.tipoPessoa}>
                <select name="tipoPessoa" value={form.tipoPessoa} onChange={handleChange}
                  className={errors.tipoPessoa ? selectErrorClass : selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  <option value="fisica" className="bg-[#0f2f52]">Física</option>
                  <option value="juridica" className="bg-[#0f2f52]">Jurídica</option>
                </select>
              </Field>

              <Field label="CPF/CNPJ" required error={errors.cpf}>
                <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="00.000.000/0000-00"
                  className={errors.cpf ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Data de Nascimento" required error={errors.dataNascimento}>
                <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange}
                  className={errors.dataNascimento ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Nome Fantasia" required error={errors.nomeFantasia}>
                <input name="nomeFantasia" value={form.nomeFantasia} onChange={handleChange} placeholder="Nome fantasia"
                  className={errors.nomeFantasia ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Inscrição Estadual" required error={errors.inscricaoEstadual} className="md:col-span-2">
                <input name="inscricaoEstadual" value={form.inscricaoEstadual} onChange={handleChange} placeholder="Inscrição estadual"
                  className={errors.inscricaoEstadual ? inputErrorClass : inputClass} />
              </Field>

            </div>
          </Section>

          {/* ENDEREÇO */}
          <Section icon={MapPin} title="Endereço" number={2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="CEP" required error={errors.cep}>
                <input name="cep" value={form.cep} onChange={handleChange} placeholder="00000-000"
                  className={errors.cep ? inputErrorClass : inputClass} />
              </Field>

              <Field label="UF" required error={errors.uf}>
                <select name="uf" value={form.uf} onChange={handleChange}
                  className={errors.uf ? selectErrorClass : selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  {UF_OPTIONS.map((u) => <option key={u} value={u} className="bg-[#0f2f52]">{u}</option>)}
                </select>
              </Field>

              <Field label="Cidade" required error={errors.cidade} className="md:col-span-2">
                <select name="cidade" value={form.cidade} onChange={handleChange}
                  className={errors.cidade ? selectErrorClass : selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione a cidade...</option>
                  {cidades.map((c) => <option key={c} value={c} className="bg-[#0f2f52]">{c}</option>)}
                </select>
              </Field>

              <Field label="Logradouro" required error={errors.logradouro} className="md:col-span-2">
                <input name="logradouro" value={form.logradouro} onChange={handleChange} placeholder="Rua, Av, Logradouro..."
                  className={errors.logradouro ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Bairro" required error={errors.bairro}>
                <input name="bairro" value={form.bairro} onChange={handleChange} placeholder="Nome do bairro"
                  className={errors.bairro ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Número" required error={errors.numero}>
                <input name="numero" value={form.numero} onChange={handleChange} placeholder="Nº"
                  className={errors.numero ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Complemento" required error={errors.complemento} className="md:col-span-2">
                <input name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto, Bloco, Sala..."
                  className={errors.complemento ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Cobrança = Entrega?" required error={errors.cobrancaMesmoEndereco} className="md:col-span-2">
                <select name="cobrancaMesmoEndereco" value={form.cobrancaMesmoEndereco} onChange={handleChange}
                  className={errors.cobrancaMesmoEndereco ? selectErrorClass : selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  <option value="sim" className="bg-[#0f2f52]">Sim</option>
                  <option value="nao" className="bg-[#0f2f52]">Não</option>
                </select>
              </Field>

            </div>
          </Section>

          {/* CONTATO E FINANCEIRO */}
          <Section icon={Banknote} title="Contato e Dados Financeiros" number={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="E-mail" error={errors.email} className="md:col-span-2">
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemplo.com"
                  className={inputClass} />
              </Field>

              <Field label="Celular / WhatsApp" required error={errors.celular}>
                <input name="celular" value={form.celular} onChange={handleChange} placeholder="(00) 00000-0000"
                  className={errors.celular ? inputErrorClass : inputClass} />
              </Field>

              <Field label="Telefone Fixo" error={errors.telefoneFixo}>
                <input name="telefoneFixo" value={form.telefoneFixo} onChange={handleChange} placeholder="(00) 0000-0000"
                  className={inputClass} />
              </Field>

              <Field label="Data de Cadastro" required>
                <input name="dataCadastro" value={form.dataCadastro} readOnly
                  className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white/30 cursor-not-allowed" />
                <span className="text-xs text-white/25 mt-1 block">Preenchido automaticamente.</span>
              </Field>

              <Field label="Status" required>
                <select name="status" value={form.status} onChange={handleChange} className={selectClass}>
                  <option value="ativo" className="bg-[#0f2f52]">Ativo</option>
                  <option value="inativo" className="bg-[#0f2f52]">Inativo</option>
                </select>
              </Field>

            </div>
          </Section>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/clientes">
              <button type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all active:scale-95">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </Link>
            <button type="button" onClick={cadastrar}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
              <Save className="w-4 h-4" /> Cadastrar Cliente
            </button>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-primary w-full max-w-sm rounded-2xl border border-white/10 p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-lg">Cliente cadastrado com sucesso!</h2>
            <button onClick={() => setModal(false)}
              className="w-full h-10 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}