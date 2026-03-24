"use client";
import { useState } from "react";

export default function CadastroCliente() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    tipoPessoa: "",
    dataNascimento: "",
    nomeFantasia: "",
    inscricaoEstadual: "",
    cep: "",
    uf: "",
    logradouro: "",
    cidade: "",
    numero: "",
    complemento: "",
    bairro: "",
    cobrancaMesmoEndereco: "",
    email: "",
    dataCadastro: "",
    celular: "",
    status: "ativo",
    telefoneFixo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modal, setModal] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validar() {
    const err: Record<string, string> = {};
    if (!form.nome) err.nome = "Obrigatório";
    if (!form.cpf) err.cpf = "Obrigatório";
    if (!form.celular) err.celular = "Obrigatório";
    if (!form.email) err.email = "Obrigatório";
    return err;
  }

  function cadastrar() {
    const err = validar();

    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    const clientes = JSON.parse(localStorage.getItem("clientes") || "[]");

    const novo = {
      id: Date.now(),
      ...form,
      telefone: form.celular,
    };

    localStorage.setItem("clientes", JSON.stringify([...clientes, novo]));

    setModal(true);

    setForm({
      nome: "",
      cpf: "",
      tipoPessoa: "",
      dataNascimento: "",
      nomeFantasia: "",
      inscricaoEstadual: "",
      cep: "",
      uf: "",
      logradouro: "",
      cidade: "",
      numero: "",
      complemento: "",
      bairro: "",
      cobrancaMesmoEndereco: "",
      email: "",
      dataCadastro: "",
      celular: "",
      status: "ativo",
      telefoneFixo: "",
    });
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-xl font-bold mb-6">Cliente</h1>

        {/* DADOS */}
        <Section title="Dados do Cliente">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Nome Completo"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              error={errors.nome}
            />
            <Input
              label="CPF/CNPJ"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              error={errors.cpf}
            />

            <Select
              label="Tipo de Pessoa"
              name="tipoPessoa"
              value={form.tipoPessoa}
              onChange={handleChange}
              options={[
                { label: "Selecione", value: "" },
                { label: "Física", value: "fisica" },
                { label: "Jurídica", value: "juridica" },
              ]}
            />

            <Input
                          label="Data de Nascimento"
                          type="date"
                          name="dataNascimento"
                          value={form.dataNascimento}
                          onChange={handleChange} error={undefined}            />

            <Input
                          label="Nome Fantasia"
                          name="nomeFantasia"
                          value={form.nomeFantasia}
                          onChange={handleChange} error={undefined}            />

            <Input
                          label="Inscrição Estadual"
                          name="inscricaoEstadual"
                          value={form.inscricaoEstadual}
                          onChange={handleChange}
                          className="md:col-span-2" error={undefined}            />
          </div>
        </Section>

        {/* ENDEREÇO */}
        <Section title="Endereço">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
                          label="CEP"
                          name="cep"
                          value={form.cep}
                          onChange={handleChange} error={undefined}            />
            <Input
                          label="UF"
                          name="uf"
                          value={form.uf}
                          onChange={handleChange} error={undefined}            />

            <Input
                          label="Logradouro"
                          name="logradouro"
                          value={form.logradouro}
                          onChange={handleChange} error={undefined}            />
            <Input
                          label="Cidade"
                          name="cidade"
                          value={form.cidade}
                          onChange={handleChange} error={undefined}            />

            <Input
                          label="Número"
                          name="numero"
                          value={form.numero}
                          onChange={handleChange} error={undefined}            />
            <Input
                          label="Complemento"
                          name="complemento"
                          value={form.complemento}
                          onChange={handleChange} error={undefined}            />

            <Input
                          label="Bairro"
                          name="bairro"
                          value={form.bairro}
                          onChange={handleChange} error={undefined}            />

            <Select
              label="Endereço de cobrança é o mesmo?"
              name="cobrancaMesmoEndereco"
              value={form.cobrancaMesmoEndereco}
              onChange={handleChange}
              options={[
                { label: "Selecione", value: "" },
                { label: "Sim", value: "sim" },
                { label: "Não", value: "nao" },
              ]}
            />
          </div>
        </Section>

        {/* FINANCEIRO */}
        <Section title="Dados Bancários/Financeiros">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="E-mail"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
                          label="Data de Cadastro"
                          type="date"
                          name="dataCadastro"
                          value={form.dataCadastro}
                          onChange={handleChange} error={undefined}            />

            <Input
              label="Celular/WhatsApp"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              error={errors.celular}
            />

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={[
                { label: "Ativo", value: "ativo" },
                { label: "Inativo", value: "inativo" },
              ]}
            />

            <Input
                          label="Telefone Fixo"
                          name="telefoneFixo"
                          value={form.telefoneFixo}
                          onChange={handleChange} error={undefined}            />
          </div>
        </Section>

        {/* BOTÕES */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-5 py-2 bg-gray-200 rounded-md">Cancelar</button>

          <button
            onClick={cadastrar}
            className="px-5 py-2 bg-[#0f2f52] text-white rounded-md hover:bg-[#092542]"
          >
            Cadastrar
          </button>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-lg font-bold mb-4">
              Cliente cadastrado com sucesso!
            </h2>

            <button
              onClick={() => setModal(false)}
              className="bg-[#0f2f52] text-white px-5 py-2 rounded-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPONENTES */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold border-b pb-2 mb-4">{title}</h2>
      {children}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string;
}

function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs mb-1 text-gray-600">{label}</label>

      <input
        {...props}
        className={`h-8 px-2 border rounded-md bg-gray-50 text-sm
    ${error ? "border-red-500" : "border-gray-300"}`}
      />

      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
}

function Select({ label, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col">
      <label className="text-xs mb-1 text-gray-600">{label}</label>

      <select
        {...props}
        className="h-8 px-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
      >
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
