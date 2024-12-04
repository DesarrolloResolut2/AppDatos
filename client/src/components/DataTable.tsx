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
            {["T4 2023", "T3 2023", "T2 2023", "T1 2023"].map((periodo) => (
              <TableHead key={periodo} className="text-right">
                {periodo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            // Extract parts from the name string safely
            const nameParts = (item.Nombre || "").split(".");
            const indicator = nameParts[0]?.trim() || "";
            const gender = nameParts[1]?.includes("Hombres") ? "Hombres" : "Mujeres";
            const region = nameParts[2]?.trim() || "";

            // Sort data points by period
            const sortedData = [...item.Data].sort((a, b) => {
              const periodA = a.Periodo.replace('T', '').split(' ');
              const periodB = b.Periodo.replace('T', '').split(' ');
              const yearDiff = parseInt(periodB[1]) - parseInt(periodA[1]);
              if (yearDiff !== 0) return yearDiff;
              return parseInt(periodB[0]) - parseInt(periodA[0]);
            });

            // Create a map of periods to values
            const periodValues = new Map(
              sortedData.map(d => [d.Periodo, d.Valor])
            );

            return (
              <TableRow key={`${indicator}-${gender}-${region}`}>
                <TableCell className="font-medium">{String(indicator)}</TableCell>
                <TableCell>{String(gender)}</TableCell>
                <TableCell>{String(region)}</TableCell>
                {["T4 2023", "T3 2023", "T2 2023", "T1 2023"].map((periodo) => {
                  const value = periodValues.get(periodo);
                  return (
                    <TableCell key={periodo} className="text-right">
                      {value !== undefined ? `${value.toFixed(2)}%` : 'N/A'}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
