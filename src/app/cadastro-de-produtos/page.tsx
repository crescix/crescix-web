"use client";
import { useState } from "react";

interface ListaPreco {
  nome: string;
  preco: string;
}

export default function CadastroProduto() {
  const [abrirPreco, setAbrirPreco] = useState(false);
  const [abrirDescricao, setAbrirDescricao] = useState(false);
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([]);
  const [imagem, setImagem] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: "",
    sku: "",
    formato: "simples",
    tipo: "produto",
    preco: "",
    unidade: "un",
    condicao: "novo",

    marca: "",
    producao: "",
    validade: "",
    freteGratis: "nao",

    pesoLiquido: "",
    pesoBruto: "",
    largura: "",
    altura: "",
    profundidade: "",
    volumes: "",
    itensCaixa: "",
    unidadeMedida: "cm",

    gtin: "",
    gtinTributario: "",
    descricao: "",
  });

  const [modal, setModal] = useState(false);

  /* INPUT */
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  /* IMAGEM */
  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  /* LISTAS DE PREÇO */
  function adicionarListaPreco() {
    setListasPreco([...listasPreco, { nome: "", preco: "" }]);
  }

  function atualizarLista(index: number, campo: keyof ListaPreco, valor: string) {
    const novas = [...listasPreco];
    novas[index] = { ...novas[index], [campo]: valor };
    setListasPreco(novas);
  }

  function removerLista(index: number) {
    setListasPreco(listasPreco.filter((_, i) => i !== index));
  }

  /* SALVAR */
  function salvarProduto() {
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");

    const novo = {
      id: Date.now(),
      ...form,
      listasPreco,
      imagem,
    };

    localStorage.setItem("produtos", JSON.stringify([...produtos, novo]));
    setModal(true);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-bold">Cadastrar Produtos</h1>

          <div className="flex gap-3">
            <button className="px-5 py-2 border rounded-md">Cancelar</button>

            <button
              onClick={salvarProduto}
              className="px-5 py-2 bg-[#0f2f52] text-white rounded-md"
            >
              Salvar Produto
            </button>
          </div>
        </div>

        {/* NOME */}
        <div className="mb-5">
          <label htmlFor="nome-produto" className="text-sm font-medium">Nome*</label>
          <input
            id="nome-produto"
            name="nome"
            value={form.nome}
            placeholder="Digite o nome do produto"
            onChange={handleChange}
            className="w-full h-9 mt-1 border rounded-md px-2"
          />
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-4">
          {/* IMAGEM */}
          <div className="col-span-1 border rounded-lg h-40 flex items-center justify-center relative overflow-hidden">
            {imagem ? (
              <img src={imagem} alt="Imagem do produto" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">Imagem</span>
            )}

            <input
              type="file"
              accept="image/*"
              title="Upload da imagem do produto"
              placeholder="Upload da imagem do produto"
              onChange={handleImagem}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* CAMPOS */}
          <div className="md:col-span-3 grid md:grid-cols-3 gap-4">
            <Input
              label="Código (SKU)"
              name="sku"
              value={form.sku}
              onChange={handleChange}
            />

            <Select
              label="Formato"
              name="formato"
              value={form.formato}
              onChange={handleChange}
              options={["Simples", "Variação"]}
            />

            <Select
              label="Tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              options={["Produto", "Serviço"]}
            />

            <Input
              label="Preço de Venda"
              name="preco"
              value={form.preco}
              onChange={handleChange}
            />

            <Input
              label="Unidade"
              name="unidade"
              value={form.unidade}
              onChange={handleChange}
            />

            <Select
              label="Condição"
              name="condicao"
              value={form.condicao}
              onChange={handleChange}
              options={["Novo", "Usado"]}
            />
          </div>
        </div>

        {/* ABA */}
        <div className="border-b mt-6 mb-4">
          <span className="text-sm font-semibold border-b-2 border-blue-500 pb-1">
            Características
          </span>
        </div>

        {/* CARACTERÍSTICAS */}
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            label="Marca"
            name="marca"
            value={form.marca}
            onChange={handleChange}
          />
          <Select
            label="Produção"
            name="producao"
            value={form.producao}
            onChange={handleChange}
            options={["Própria", "Terceiros"]}
          />

          <Input
            label="Data de Validade"
            type="date"
            name="validade"
            value={form.validade}
            onChange={handleChange}
          />

          <Select
            label="Frete Grátis"
            name="freteGratis"
            value={form.freteGratis}
            onChange={handleChange}
            options={["Sim", "Não"]}
          />

          <Input
            label="Peso Líquido"
            name="pesoLiquido"
            value={form.pesoLiquido}
            onChange={handleChange}
          />
          <Input
            label="Peso Bruto"
            name="pesoBruto"
            value={form.pesoBruto}
            onChange={handleChange}
          />

          <Input
            label="Largura"
            name="largura"
            value={form.largura}
            onChange={handleChange}
          />
          <Input
            label="Altura"
            name="altura"
            value={form.altura}
            onChange={handleChange}
          />

          <Input
            label="Profundidade"
            name="profundidade"
            value={form.profundidade}
            onChange={handleChange}
          />
          <Input
            label="Volumes"
            name="volumes"
            value={form.volumes}
            onChange={handleChange}
          />

          <Input
            label="Itens por caixa"
            name="itensCaixa"
            value={form.itensCaixa}
            onChange={handleChange}
          />

          <Select
            label="Unidade de medida"
            name="unidadeMedida"
            value={form.unidadeMedida}
            onChange={handleChange}
            options={["Centímetros", "Metros"]}
          />

          <Input
            label="GTIN/EAN"
            name="gtin"
            value={form.gtin}
            onChange={handleChange}
          />
          <Input
            label="GTIN Tributário"
            name="gtinTributario"
            value={form.gtinTributario}
            onChange={handleChange}
          />
        </div>

        {/* LISTAS DE PREÇO */}
        <div className="mt-8 border-t pt-6">
          <div
            onClick={() => setAbrirPreco(!abrirPreco)}
            className="flex justify-between cursor-pointer"
          >
            <h3 className="text-lg font-semibold">Listas de preço</h3>
            <span className={`transition ${abrirPreco ? "rotate-180" : ""}`}>
              ▼
            </span>
          </div>

          {abrirPreco && (
            <>
              <button
                onClick={adicionarListaPreco}
                className="mt-4 border px-4 py-2 rounded-md"
              >
                + Incluir lista
              </button>

              <div className="mt-4 space-y-3">
                {listasPreco.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-3 gap-3">
                    <input
                      placeholder="Nome da lista"
                      value={item.nome}
                      onChange={(e) =>
                        atualizarLista(index, "nome", e.target.value)
                      }
                      className="h-9 border rounded px-2"
                    />

                    <input
                      type="number"
            placeholder="Preço da lista"
            title="Preço da lista"
                      value={item.preco}
                      onChange={(e) =>
                        atualizarLista(index, "preco", e.target.value)
                      }
                      className="h-9 border rounded px-2"
                    />

                    <button
                      onClick={() => removerLista(index)}
                      className="bg-red-500 text-white rounded px-3"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div className="mt-8 border-t pt-6">
          <div
            onClick={() => setAbrirDescricao(!abrirDescricao)}
            className="flex justify-between cursor-pointer"
          >
            <h3 className="text-lg font-semibold">Descrição curta</h3>
            <span
              className={`transition ${abrirDescricao ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </div>

          {abrirDescricao && (
            <textarea 
              className="w-full mt-3 h-24 border rounded p-2" 
              placeholder="Digite a descrição curta do produto"
              title="Descrição curta"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
            />
          )}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="font-bold mb-4">Produto salvo com sucesso!</h2>
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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...props }: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="text-xs mb-1 text-gray-600">{label}</label>
      <input {...props} className="h-8 px-2 border rounded-md text-sm" />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

function Select({ label, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col">
      <label className="text-xs mb-1 text-gray-600">{label}</label>
      <select {...props} className="h-8 px-2 border rounded-md text-sm">
        {options.map((opt, i) => (
          <option key={i} value={opt.toLowerCase()}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
