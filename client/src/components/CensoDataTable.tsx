import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { CensoDataItem } from "../lib/types";

interface CensoDataTableProps {
  data: CensoDataItem[];
  selectedYear?: number;
}

export function CensoDataTable({ data, selectedYear }: CensoDataTableProps) {
  const allProcessedData = data.flatMap((item) => {
    return item.Data
      .filter(d => !d.Secreto && (!selectedYear || d.Anyo === selectedYear))
      .map(d => ({
        nombre: item.nombreLimpio,
        tipo: item.tipo,
        genero: item.genero,
        year: d.Anyo,
        habitantes: d.Valor,
      }));
  }).sort((a, b) => {
    if (a.nombre !== b.nombre) return a.nombre.localeCompare(b.nombre);
    if (a.year !== b.year) return b.year - a.year;
    return 0;
  });

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Año</TableHead>
            <TableHead className="text-right">Habitantes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allProcessedData.map((d, idx) => (
            <TableRow key={`${d.nombre}-${d.year}-${d.genero}-${idx}`}>
              <TableCell>{d.nombre}</TableCell>
              <TableCell>{d.genero}</TableCell>
              <TableCell>{d.year}</TableCell>
              <TableCell className="text-right">
                {new Intl.NumberFormat('es-ES').format(d.habitantes)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
