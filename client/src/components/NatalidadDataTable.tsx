import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface NatalidadDataItem {
  provincia: string;
  year: number;
  valor: number;
}

interface NatalidadDataTableProps {
  data: NatalidadDataItem[];
  selectedYear?: number;
}

export function NatalidadDataTable({ data, selectedYear }: NatalidadDataTableProps) {
  const filteredData = selectedYear 
    ? data.filter(item => item.year === selectedYear)
    : data;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provincia</TableHead>
            <TableHead>Año</TableHead>
            <TableHead className="text-right">Tasa de Natalidad (por mil habitantes)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item, idx) => (
            <TableRow key={`${item.provincia}-${item.year}-${idx}`}>
              <TableCell>{item.provincia}</TableCell>
              <TableCell>{item.year}</TableCell>
              <TableCell className="text-right">{item.valor.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}