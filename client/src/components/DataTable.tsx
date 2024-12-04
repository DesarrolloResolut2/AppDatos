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
            // Extract parts from the name string safely
            const nameParts = (item.Nombre || "").split(".");
            const indicator = nameParts[0]?.trim() || "";
            const gender = nameParts[1]?.includes("Hombres") ? "Hombres" : "Mujeres";
            const region = nameParts[2]?.trim() || "";

            // Get the latest data point and ensure we have primitive values
            const latestData = Array.isArray(item.Data) && item.Data.length > 0 ? item.Data[0] : null;
            const value = latestData && typeof latestData.Valor === 'number' ? latestData.Valor.toFixed(2) : 'N/A';
            const periodo = latestData && typeof latestData.Periodo === 'string' ? latestData.Periodo : 'N/A';
            
            return (
              <TableRow key={`${indicator}-${gender}-${region}`}>
                <TableCell className="font-medium">{String(indicator)}</TableCell>
                <TableCell>{String(gender)}</TableCell>
                <TableCell>{String(region)}</TableCell>
                <TableCell className="text-right">
                  {value === 'N/A' ? value : `${value}%`}
                </TableCell>
                <TableCell className="text-right">
                  {String(periodo)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
