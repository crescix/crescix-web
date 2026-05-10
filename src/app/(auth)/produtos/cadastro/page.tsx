"use client";
import { useState } from "react";
import { Package, Ruler, Tag, ChevronLeft, Save, X, Upload, ChevronDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ListaPreco {
  nome: string;
  preco: string;
}

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
const selectClass = "w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer";

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

function CollapsibleSection({ icon: Icon, title, number, children }: {
  icon: React.ElementType; title: string; number: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-primary rounded-2xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
            {number}
          </span>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white/50" />
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-6">{children}</div>}
    </div>
  );
}

export default function CadastroProduto() {
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([]);
  const [imagem, setImagem] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    nome: "", sku: "", formato: "simples", tipo: "produto", preco: "",
    unidade: "un", condicao: "novo", marca: "", producao: "", validade: "",
    freteGratis: "nao", pesoLiquido: "", pesoBruto: "", largura: "", altura: "",
    profundidade: "", volumes: "", itensCaixa: "", unidadeMedida: "cm",
    gtin: "", gtinTributario: "", descricao: "",
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
    <div className="w-full min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/produtos" className="p-2 rounded-xl text-white/50 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">
              Cadastros / Produtos
            </p>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              Cadastro de Produto
            </h1>
          </div>
        </div>

        <div className="space-y-5">

          {/* DADOS DO PRODUTO */}
          <Section icon={Package} title="Dados do Produto" number={1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <div className="lg:col-span-4 flex flex-col md:flex-row gap-5">
                <div className="shrink-0">
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5">
                    Imagem do Produto
                  </label>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-xl w-40 h-40 bg-white/5 hover:bg-cyan-500/5 hover:border-cyan-500/30 transition-all cursor-pointer group overflow-hidden relative">
                    {imagem ? (
                      <img src={imagem} alt="Produto" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-white/20 group-hover:text-cyan-400 transition-colors" />
                        <span className="text-xs text-white/30 group-hover:text-cyan-400 text-center px-2 transition-colors">
                          Clique para upload
                        </span>
                        <span className="text-xs text-white/20">PNG, JPG até 2MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImagem} className="hidden" />
                  </label>
                </div>
                <div className="flex-1">
                  <Field label="Nome do Produto" required>
                    <input name="nome" value={form.nome} onChange={handleChange}
                      placeholder="Digite o nome do produto" className={inputClass} />
                  </Field>
                </div>
              </div>

              <Field label="Código (SKU)">
                <input name="sku" value={form.sku} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Formato">
                <select name="formato" value={form.formato} onChange={handleChange} className={selectClass}>
                  <option value="simples" className="bg-[#0f2f52]">Simples</option>
                  <option value="variacao" className="bg-[#0f2f52]">Variação</option>
                </select>
              </Field>

              <Field label="Tipo">
                <select name="tipo" value={form.tipo} onChange={handleChange} className={selectClass}>
                  <option value="produto" className="bg-[#0f2f52]">Produto</option>
                  <option value="servico" className="bg-[#0f2f52]">Serviço</option>
                </select>
              </Field>

              <Field label="Condição">
                <select name="condicao" value={form.condicao} onChange={handleChange} className={selectClass}>
                  <option value="novo" className="bg-[#0f2f52]">Novo</option>
                  <option value="usado" className="bg-[#0f2f52]">Usado</option>
                </select>
              </Field>

              <Field label="Preço de Venda" required>
                <input name="preco" value={form.preco} onChange={handleChange} placeholder="R$ 0,00" className={inputClass} />
              </Field>

              <Field label="Unidade">
                <input name="unidade" value={form.unidade} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Frete Grátis">
                <select name="freteGratis" value={form.freteGratis} onChange={handleChange} className={selectClass}>
                  <option value="nao" className="bg-[#0f2f52]">Não</option>
                  <option value="sim" className="bg-[#0f2f52]">Sim</option>
                </select>
              </Field>

              <Field label="GTIN/EAN">
                <input name="gtin" value={form.gtin} onChange={handleChange} className={inputClass} />
              </Field>

            </div>
          </Section>

          {/* CARACTERÍSTICAS */}
          <Section icon={Tag} title="Características" number={2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Marca">
                <input name="marca" value={form.marca} onChange={handleChange} className={inputClass} />
              </Field>

              <Field label="Produção">
                <select name="producao" value={form.producao} onChange={handleChange} className={selectClass}>
                  <option value="" className="bg-[#0f2f52]">Selecione...</option>
                  <option value="propria" className="bg-[#0f2f52]">Própria</option>
                  <option value="terceiros" className="bg-[#0f2f52]">Terceiros</option>
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
          <Section icon={Ruler} title="Dimensões e Peso" number={3}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <Field label="Peso Líquido">
                <input name="pesoLiquido" value={form.pesoLiquido} onChange={handleChange} placeholder="kg" className={inputClass} />
              </Field>

              <Field label="Peso Bruto">
                <input name="pesoBruto" value={form.pesoBruto} onChange={handleChange} placeholder="kg" className={inputClass} />
              </Field>

              <Field label="Unidade de Medida">
                <select name="unidadeMedida" value={form.unidadeMedida} onChange={handleChange} className={selectClass}>
                  <option value="cm" className="bg-[#0f2f52]">Centímetros</option>
                  <option value="m" className="bg-[#0f2f52]">Metros</option>
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
          <CollapsibleSection icon={Tag} title="Listas de Preço" number={4}>
            <button
              type="button"
              onClick={adicionarListaPreco}
              className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white/70 transition-colors"
            >
              + Incluir lista
            </button>
            <div className="space-y-3">
              {listasPreco.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input placeholder="Nome da lista" value={item.nome}
                    onChange={(e) => atualizarLista(index, "nome", e.target.value)} className={inputClass} />
                  <input type="number" placeholder="Preço da lista" value={item.preco}
                    onChange={(e) => atualizarLista(index, "preco", e.target.value)} className={inputClass} />
                  <button type="button" onClick={() => removerLista(index)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
                    <X className="w-4 h-4" /> Remover
                  </button>
                </div>
              ))}
              {listasPreco.length === 0 && (
                <p className="text-sm text-white/25">Nenhuma lista adicionada.</p>
              )}
            </div>
          </CollapsibleSection>

          {/* DESCRIÇÃO — colapsável */}
          <CollapsibleSection icon={Package} title="Descrição Curta" number={5}>
            <textarea
              name="descricao" value={form.descricao} onChange={handleChange}
              placeholder="Digite a descrição curta do produto..." rows={4}
              className="w-full px-3.5 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:outline-none focus:border-cyan-500/50 transition-all resize-none"
            />
          </CollapsibleSection>

          {/* BOTÕES */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Link href="/produtos">
              <button type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm font-semibold transition-all active:scale-95">
                <X className="w-4 h-4" /> Cancelar
              </button>
            </Link>
            <button type="button" onClick={salvarProduto}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all active:scale-95">
              <Save className="w-4 h-4" /> Salvar Produto
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
            <h2 className="text-white font-bold text-lg">Produto salvo com sucesso!</h2>
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