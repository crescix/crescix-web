'use client'
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Fornecedor } from "@/lib/data/fornecedores";
import Link from "next/link";

interface FornecedorRowProps {
    data: Fornecedor;
    onDelete: (fornecedor: Fornecedor) => void; // Nova prop para avisar o pai
}

export function FornecedorItem({ data, onDelete }: FornecedorRowProps) {
    return (
        <TableRow className="border-b bg-primary border-white/10 transition-colors group">
            <TableCell className="font-bold text-white py-4">
                {data.razaoSocial}
            </TableCell>

            <TableCell className="text-white/70">
                {data.cnpj}
            </TableCell>

            <TableCell className="text-white/70 max-w-[250px] truncate" title={data.endereco}>
                {data.endereco}
            </TableCell>

            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Link href={'/fornecedores/editar/'}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => onDelete(data)} 
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}           