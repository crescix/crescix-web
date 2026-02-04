"use client";

import { Plus, Search, Filter } from "lucide-react";
import { fornecedoresData, Fornecedor } from "@/lib/data/fornecedores";
import { FornecedorItem } from "@/components/fornecedores/fornecedor-item"; // Importe o componente novo
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalExclusao } from "@/components/fornecedores/modal-exclusao";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FornecedoresPage() {

  const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState<Fornecedor | null>(null); 
  const groupedFornecedores = fornecedoresData.reduce((acc, curr) => {
    if (!acc[curr.type]) {
      acc[curr.type] = [];
    }
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, Fornecedor[]>);

  const types = Object.keys(groupedFornecedores);

  useEffect(() =>{
    console.log(fornecedorParaExcluir) //tá dando certo, mas o modal não aparece 

  }, [fornecedorParaExcluir])

  return (
    
    <div className="w-full bg-secondary p-4 md:p-8 flex flex-col items-center ">
       <ModalExclusao
          isOpen={!!fornecedorParaExcluir}
          onOpenChange={(open) => !open && setFornecedorParaExcluir(null)}
          onConfirm={() => {
            console.log("Excluindo...", fornecedorParaExcluir?.id); 
            setFornecedorParaExcluir(null);
          }}
          fornecedor={fornecedorParaExcluir}
        />
      <div className="w-full max-w-6xl space-y-6">
        
        {/* CABEÇALHO (Igual ao anterior) */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">
              FORNECEDORES
            </h1>
            <p className="text-white/60 text-sm">Gerencie seus parceiros de negócio</p>
          </div>

          <Link href="/fornecedores/cadastro">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all hover:scale-105">
                <Plus className="mr-2 h-5 w-5" />
                Novo Fornecedor
            </Button>
          </Link>
        </div>

        {/* FILTROS (Igual ao anterior) */}
        <div className="flex gap-3 bg-primary p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="relative flex-1">
                <Input 
                    placeholder="Buscar por razão social ou CNPJ..." 
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-400 h-10"
                />
            </div>
            <Button variant="outline" className="border-white/10 text-white/70 hover:bg-white/10 hover:text-white">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
            </Button>
        </div>

       

        {/* LISTAGEM COM TABELA DENTRO DO ACCORDION */}
        <div className="space-y-4">
            <Accordion type="multiple" defaultValue={types} className="w-full space-y-6">
                {types.map((type) => (
                    <AccordionItem key={type} value={type} className="border-none bg-primary rounded-xl px-4 py-2 shadow-lg">
                        <AccordionTrigger className="hover:no-underline py-8 px-2 group">
                             <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-white uppercase tracking-wider group-data-[state=open]:text-cyan-400 transition-colors">
                                    {type}
                                </span>
                                <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                                    {groupedFornecedores[type].length}
                                </span>
                             </div>
                        </AccordionTrigger>
                        
                        <AccordionContent className="pb-4">
                            {/* AQUI ENTRA A ESTRUTURA DA TABELA */}
                            <div className="rounded-md border border-white/10 overflow-hidden my-5">
                              <Table>
                                <TableHeader className="bg-white/5">
                                  <TableRow className="border-white/10 hover:bg-transparent">
                                    <TableHead className="text-white/60 w-[40%]">RAZÃO SOCIAL</TableHead>
                                    <TableHead className="text-white/60">CNPJ</TableHead>
                                    <TableHead className="text-white/60">ENDEREÇO</TableHead>
                                    <TableHead className=" text-white/60">AÇÕES</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {groupedFornecedores[type].map((fornecedor) => (
                                        <FornecedorItem key={fornecedor.id} 
                                        data={fornecedor} 
                                        onDelete={(f) => setFornecedorParaExcluir(f)}/>
                                    ))}
                                </TableBody>
                              </Table>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

      </div>
    </div>
  );
}