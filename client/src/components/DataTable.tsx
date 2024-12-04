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
            <TableHead>Año</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Nombre Periodo</TableHead>
            <TableHead className="text-right">Tasa de Actividad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            // Process and sort data points
            const processedData = item.Data
              .filter(d => !d.Secreto) // Filter out secret records
              .map(d => {
                const period = typeof d.Periodo === 'object' ? d.Periodo : { Anyo: 0, Nombre_largo: '', NombrePeriodo: '' };
                const year = period.Anyo;
                const quarterMatch = period.Nombre_largo?.match(/Trimestre (\d)/);
                const quarter = quarterMatch ? parseInt(quarterMatch[1]) : 0;
                
                return {
                  year,
                  quarter,
                  periodName: period.Nombre_largo || '',
                  shortPeriod: period.NombrePeriodo || '',
                  value: d.Valor
                };
              })
              .sort((a, b) => {
                // Sort by year (descending) and quarter (ascending)
                const yearDiff = b.year - a.year;
                if (yearDiff !== 0) return yearDiff;
                return a.quarter - b.quarter;
              });

            // Create table rows for each processed data point
            return processedData.map((d, idx) => (
              <TableRow key={`${item.Nombre}-${idx}`}>
                <TableCell>{d.year}</TableCell>
                <TableCell>{d.periodName}</TableCell>
                <TableCell>{d.shortPeriod}</TableCell>
                <TableCell className="text-right">
                  {d.value.toFixed(2)}%
                </TableCell>
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </Card>
  );
}