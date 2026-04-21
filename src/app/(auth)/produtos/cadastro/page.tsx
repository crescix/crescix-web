"use client";
import { useState } from "react";
import { Package, Ruler, Tag, ChevronLeft, Save, X, Upload, ChevronDown } from "lucide-react";
import Link from "next/link";

interface ListaPreco {
  nome: string;
  preco: string;
}

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

// ─── Seção colapsável ─────────────────────────────────────────────────────────
function CollapsibleSection({
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
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${accent}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CadastroProduto() {
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([]);
  const [imagem, setImagem] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagem(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

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

  function salvarProduto() {
    const produtos = JSON.parse(localStorage.getItem("produtos") || "[]");
    const novo = { id: Date.now(), ...form, listasPreco, imagem };
    localStorage.setItem("produtos", JSON.stringify([...produtos, novo]));
    setModal(true);
  }

  return (
    <div className="min-h-screen w-full bg-transparent py-4">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center gap-4">
          <Link
            href="/produtos"
            className="p-2 rounded-xl text-black hover:bg-white hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
              Cadastro de Produto
            </h1>
            <p className="text-lg text-gray-800 mt-0.5">
              Preencha os dados do novo produto
            </p>
          </div>
        </div>

        <div className="space-y-5">

          {/* DADOS PRINCIPAIS */}
          <Section icon={Package} title="Dados do Produto" accent="bg-teal-50 text-teal-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              {/* Imagem + Nome lado a lado no topo */}
              <div className="lg:col-span-4 flex flex-col md:flex-row gap-5">
                {/* Upload de imagem */}
                <div className="shrink-0">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    Imagem do Produto
                  </label>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl w-40 h-40 bg-gray-50 hover:bg-teal-50 hover:border-teal-300 transition-all cursor-pointer group overflow-hidden relative">
                    {imagem ? (
                      <img src={imagem} alt="Produto" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
                        <span className="text-xs text-gray-400 group-hover:text-teal-600 text-center px-2">
                          Clique para upload
                        </span>
                        <span className="text-xs text-gray-300">PNG, JPG até 2MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImagem} className="hidden" />
                  </label>
                </div>

                {/* Nome */}
                <div className="flex-1">
                  <Field label="Nome do Produto" required>
                    <input
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      placeholder="Digite o nome do produto"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>

              <Field label="Código (SKU)">
                <input name="sku" value={form.sku} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Formato">
                <select name="formato" value={form.formato} onChange={handleChange} className={selectClass}>
                  <option value="simples">Simples</option>
                  <option value="variacao">Variação</option>
                </select>
              </Field>

              <Field label="Tipo">
                <select name="tipo" value={form.tipo} onChange={handleChange} className={selectClass}>
                  <option value="produto">Produto</option>
                  <option value="servico">Serviço</option>
                </select>
              </Field>

              <Field label="Condição">
                <select name="condicao" value={form.condicao} onChange={handleChange} className={selectClass}>
                  <option value="novo">Novo</option>
                  <option value="usado">Usado</option>
                </select>
              </Field>

              <Field label="Preço de Venda" required>
                <input
                  name="preco" value={form.preco} onChange={handleChange}
                  placeholder="R$ 0,00"
                  className={inputClass}
                />
              </Field>

              <Field label="Unidade">
                <input name="unidade" value={form.unidade} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Frete Grátis">
                <select name="freteGratis" value={form.freteGratis} onChange={handleChange} className={selectClass}>
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </Field>

              <Field label="GTIN/EAN">
                <input name="gtin" value={form.gtin} onChange={handleChange} className={inputClass} />
              </Field>

            </div>
          </Section>

          {/* CARACTERÍSTICAS */}
          <Section icon={Tag} title="Características" accent="bg-blue-50 text-blue-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Marca">
                <input name="marca" value={form.marca} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Produção">
                <select name="producao" value={form.producao} onChange={handleChange} className={selectClass}>
                  <option value="">Selecione...</option>
                  <option value="propria">Própria</option>
                  <option value="terceiros">Terceiros</option>
                </select>
              </Field>

              <Field label="Data de Validade">
                <input name="validade" type="date" value={form.validade} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="GTIN Tributário">
                <input name="gtinTributario" value={form.gtinTributario} onChange={handleChange} className={inputClass} />
              </Field>

            </div>
          </Section>

          {/* DIMENSÕES E PESO */}
          <Section icon={Ruler} title="Dimensões e Peso" accent="bg-violet-50 text-violet-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Peso Líquido">
                <input name="pesoLiquido" value={form.pesoLiquido} onChange={handleChange} placeholder="kg" className={inputClass} />
              </Field>

              <Field label="Peso Bruto">
                <input name="pesoBruto" value={form.pesoBruto} onChange={handleChange} placeholder="kg" className={inputClass} />
              </Field>

              <Field label="Unidade de Medida">
                <select name="unidadeMedida" value={form.unidadeMedida} onChange={handleChange} className={selectClass}>
                  <option value="cm">Centímetros</option>
                  <option value="m">Metros</option>
                </select>
              </Field>

              <Field label="Volumes">
                <input name="volumes" value={form.volumes} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Largura">
                <input name="largura" value={form.largura} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Altura">
                <input name="altura" value={form.altura} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Profundidade">
                <input name="profundidade" value={form.profundidade} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Itens por Caixa">
                <input name="itensCaixa" value={form.itensCaixa} onChange={handleChange} className={inputClass} />
              </Field>

            </div>
          </Section>

          {/* LISTAS DE PREÇO — colapsável */}
          <CollapsibleSection icon={Tag} title="Listas de Preço" accent="bg-amber-50 text-amber-600">
            <button
              type="button"
              onClick={adicionarListaPreco}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              + Incluir lista
            </button>

            <div className="space-y-3">
              {listasPreco.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    placeholder="Nome da lista"
                    value={item.nome}
                    onChange={(e) => atualizarLista(index, "nome", e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    placeholder="Preço da lista"
                    value={item.preco}
                    onChange={(e) => atualizarLista(index, "preco", e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removerLista(index)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" /> Remover
                  </button>
                </div>
              ))}
              {listasPreco.length === 0 && (
                <p className="text-sm text-gray-400">Nenhuma lista adicionada.</p>
              )}
            </div>
          </CollapsibleSection>

          {/* DESCRIÇÃO — colapsável */}
          <CollapsibleSection icon={Package} title="Descrição Curta" accent="bg-emerald-50 text-emerald-600">
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Digite a descrição curta do produto..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
            />
          </CollapsibleSection>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/produtos">
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
              onClick={salvarProduto}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Produto
            </button>
          </div>

        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl text-center shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Produto salvo com sucesso!</h2>
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