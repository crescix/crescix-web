"use client";
import { useState, useEffect, ChangeEvent } from "react";

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

export default function CadastroCliente() {
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const initialForm: FormState = {
    nome: "", tipoCpfCnpj: "", cpf: "", tipoPessoa: "",
    dataNascimento: "22/07/2000", nomeFantasia: "", inscricaoEstadual: "",
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
    <div className="min-h-screen bg-transparent p-6 w-full m-5">
      <div className="max-w-[1100px] mx-auto bg-white p-8 rounded-xl shadow min-h-[80vh]">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <span>···</span>
          <span>&gt;</span>
          <span className="font-semibold text-gray-800">Cliente</span>
        </div>

        {/* DADOS DO CLIENTE */}
        <Section title="Dados do Cliente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="Nome Completo" required
              name="nome" placeholder="Digite seu nome completo"
              value={form.nome} onChange={handleChange} error={errors.nome}
            />

            <div className="flex flex-col">
              <Label required>CPF/CNPJ</Label>
              <select
                name="tipoCpfCnpj" value={form.tipoCpfCnpj} onChange={handleChange}
                className={`h-9 px-2 border rounded-md bg-gray-50 text-sm text-gray-800 focus:outline-none
                  ${errors.tipoCpfCnpj ? "border-red-500" : "border-gray-300"}`}
              >
                <option value="">Selecione uma opção</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
              </select>
            </div>

            <Select
              label="Tipo de Pessoa" required
              name="tipoPessoa" value={form.tipoPessoa}
              onChange={handleChange} error={errors.tipoPessoa}
              options={[
                { label: "Selecione pessoa física ou jurídica", value: "" },
                { label: "Física", value: "fisica" },
                { label: "Jurídica", value: "juridica" },
              ]}
            />

            <Input
              label="CPF/CNPJ" required
              name="cpf" placeholder="00.000.000/0000-00"
              value={form.cpf} onChange={handleChange} error={errors.cpf}
            />

            <Input
              label="Data de Nascimento" required
              name="dataNascimento" type="date"
              value={form.dataNascimento} onChange={handleChange} error={errors.dataNascimento}
            />

            <Input
              label="Nome Fantasia" required
              name="nomeFantasia" placeholder="Nome do bairro"
              value={form.nomeFantasia} onChange={handleChange} error={errors.nomeFantasia}
            />

            <div className="md:col-span-2">
              <Input
                label="Inscrição Estadual" required
                name="inscricaoEstadual" placeholder="Nome da casa, empresa, galpão, depósito..."
                value={form.inscricaoEstadual} onChange={handleChange} error={errors.inscricaoEstadual}
              />
            </div>

          </div>
        </Section>

        {/* ENDEREÇO */}
        <Section title="Endereço">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="CEP" required
              name="cep" placeholder="Digite o CEP"
              value={form.cep} onChange={handleChange} error={errors.cep}
            />

            <Select
              label="UF" required
              name="uf" value={form.uf}
              onChange={handleChange} error={errors.uf}
              options={[
                { label: "Selecione o estado", value: "" },
                ...UF_OPTIONS.map((u) => ({ label: u, value: u })),
              ]}
            />

            <Input
              label="Logradouro" required
              name="logradouro" placeholder="Digite o logradouro"
              value={form.logradouro} onChange={handleChange} error={errors.logradouro}
            />

            <Select
              label="Cidade" required
              name="cidade" value={form.cidade}
              onChange={handleChange} error={errors.cidade}
              options={[
                { label: "Selecione a cidade", value: "" },
                ...cidades.map((c) => ({ label: c, value: c })),
              ]}
            />

            <Input
              label="Número" required
              name="numero" placeholder="Digite o número da residência"
              value={form.numero} onChange={handleChange} error={errors.numero}
            />

            <Input
              label="Complemento" required
              name="complemento" placeholder="(Apto, Bloco)"
              value={form.complemento} onChange={handleChange} error={errors.complemento}
            />

            <Input
              label="Bairro" required
              name="bairro" placeholder="Digite o nome do bairro"
              value={form.bairro} onChange={handleChange} error={errors.bairro}
            />

            <Select
              label="Endereço de cobrança é o mesmo da entrega?" required
              name="cobrancaMesmoEndereco" value={form.cobrancaMesmoEndereco}
              onChange={handleChange} error={errors.cobrancaMesmoEndereco}
              options={[
                { label: "Selecione a opção", value: "" },
                { label: "Sim", value: "sim" },
                { label: "Não", value: "nao" },
              ]}
            />

          </div>
        </Section>

        {/* DADOS BANCÁRIOS / FINANCEIROS */}
        <Section title="Dados Bancários/Financeiros">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <Input
              label="E-mail"
              name="email" placeholder="Digite o e-mail"
              value={form.email} onChange={handleChange}
            />

            <div className="flex flex-col">
              <Label required>Data de Cadastro</Label>
              <select
                name="dataCadastro" value={form.dataCadastro} onChange={handleChange}
                className="h-9 px-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-800 focus:outline-none"
              >
                <option value={hoje}>{hoje}</option>
              </select>
              <span className="text-xs text-gray-400 mt-1">Preenchido automaticamente.</span>
            </div>

            <Input
              label="Celular/WhatsApp" required
              name="celular" placeholder="Adicione o número de telefone/WhatsApp"
              value={form.celular} onChange={handleChange} error={errors.celular}
            />

            <div className="flex flex-col">
              <Label required>Status</Label>
              <select
                name="status" value={form.status} onChange={handleChange}
                className="h-9 px-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-800 w-32 focus:outline-none"
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <Input
              label="Telefone Fixo"
              name="telefoneFixo" placeholder="(XX) X XXXX-XXXX"
              value={form.telefoneFixo} onChange={handleChange}
            />

          </div>
        </Section>

        {/* BOTÕES */}
        <div className="flex justify-end gap-3 mt-10">
          <button className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={cadastrar}
            className="px-6 py-2 bg-[#0f2f52] text-white rounded-md text-sm hover:bg-[#092542]"
          >
            Cadastrar
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center shadow-xl">
            <h2 className="text-lg font-bold mb-4">Cliente cadastrado com sucesso!</h2>
            <button
              onClick={() => setModal(false)}
              className="bg-[#0f2f52] text-white px-6 py-2 rounded-md text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── COMPONENTES ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs mb-1 text-gray-600">
      {required && <span className="text-red-500 mr-0.5">*</span>}
      {children}
    </label>
  );
}

type InputProps = {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Input({ label, required, error, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Label required={required}>{label}</Label>
      <input
        {...props}
        className={`h-9 px-3 border rounded-md bg-gray-50 text-sm text-gray-800 focus:outline-none
          ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}

type SelectProps = {
  label: string;
  required?: boolean;
  options: SelectOption[];
  error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

function Select({ label, required, options, error, ...props }: SelectProps) {
  return (
    <div className="flex flex-col">
      <Label required={required}>{label}</Label>
      <select
        {...props}
        className={`h-9 px-3 border rounded-md bg-white text-gray-800 text-sm focus:outline-none
          ${error ? "border-red-500" : "border-gray-300"}`}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}