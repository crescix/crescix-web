/**
 * Skeleton para o estado de carregamento de tabelas.
 *
 * Renderiza N linhas com células cinzas pulsantes. Aceita `columns`
 * (número de colunas) e `rows` (número de linhas, default 6) para
 * imitar a estrutura da tabela alvo.
 */
import { TableCell, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow
          key={rowIdx}
          className="border-b border-white/5 hover:bg-transparent"
        >
          {Array.from({ length: columns }).map((__, colIdx) => (
            <TableCell key={colIdx} className="py-4">
              <div
                className="h-3 rounded-md bg-white/5 animate-pulse"
                style={{
                  // Varia a largura pra parecer dado real
                  width: `${60 + ((rowIdx * 13 + colIdx * 7) % 35)}%`,
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
