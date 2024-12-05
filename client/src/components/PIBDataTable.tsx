import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { PIBDataItem } from "../lib/types";

interface PIBDataTableProps {
  data: PIBDataItem[];
  selectedYear?: number;
}

export function PIBDataTable({ data, selectedYear }: PIBDataTableProps) {
  const processedData = data.flatMap((item) => {
    return item.Data
      .filter(d => !d.Secreto && (!selectedYear || parseInt(d.NombrePeriodo) === selectedYear))
      .map(d => {
        const year = parseInt(d.NombrePeriodo.replace("(P)", ""));
        return {
          provincia: item.provincia,
          categoria: item.categoria,
          tipo: item.tipo,
          year,
          valor: d.Valor
        };
      });
  }).sort((a, b) => {
    // Ordenar primero por tipo (general primero), luego por provincia y año
    if (a.tipo !== b.tipo) return a.tipo === 'general' ? -1 : 1;
    const provinciaCompare = a.provincia.localeCompare(b.provincia);
    if (provinciaCompare !== 0) return provinciaCompare;
    return b.year - a.year;
  });

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provincia</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Año</TableHead>
            <TableHead className="text-right">Valor (miles de euros)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedData.map((d, idx) => (
            <TableRow 
              key={`${d.provincia}-${d.categoria}-${d.year}-${idx}`}
              className={d.tipo === 'general' ? 'font-medium bg-muted/30' : ''}
            >
              <TableCell>{d.provincia}</TableCell>
              <TableCell>{d.categoria}</TableCell>
              <TableCell>{d.year}</TableCell>
              <TableCell className="text-right">
                {formatValue(d.valor)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
