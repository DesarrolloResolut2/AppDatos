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
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Periodo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            // Extract parts from the name string
            const nameParts = item.Nombre.split(".");
            const indicator = nameParts[0]?.trim() || "";
            const gender = nameParts[1]?.includes("Hombres") ? "Hombres" : "Mujeres";
            const region = nameParts[2]?.trim() || "";

            // Get the latest data point
            const latestData = item.Data[0];
            
            return (
              <TableRow key={item.Nombre}>
                <TableCell className="font-medium">{indicator}</TableCell>
                <TableCell>{gender}</TableCell>
                <TableCell>{region}</TableCell>
                <TableCell className="text-right">
                  {latestData?.Valor !== undefined ? `${latestData.Valor.toFixed(2)}%` : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {latestData?.Periodo || 'N/A'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
