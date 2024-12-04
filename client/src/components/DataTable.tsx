import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { INEDataItem } from "../lib/types";

interface DataTableProps {
  data: INEDataItem[];
}

export function DataTable({ data }: DataTableProps) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Indicador</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Región</TableHead>
            <TableHead className="text-right">Último Valor</TableHead>
            <TableHead className="text-right">Periodo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.Nombre}>
              <TableCell className="font-medium">
                {item.Nombre.split(".")[0]}
              </TableCell>
              <TableCell>{item.Nombre.includes("Hombres") ? "Hombres" : "Mujeres"}</TableCell>
              <TableCell>{item.Nombre.split(".")[2]}</TableCell>
              <TableCell className="text-right">
                {item.Data[0]?.Valor.toFixed(2)}%
              </TableCell>
              <TableCell className="text-right">
                {item.Data[0]?.Periodo}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
