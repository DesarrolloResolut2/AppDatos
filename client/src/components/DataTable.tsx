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
  selectedYear?: number;
}

export function DataTable({ data, selectedYear }: DataTableProps) {
  const allProcessedData = data.flatMap((item) => {
    // Extract province from item.Nombre
    const parts = item.Nombre.split(". ");
    const provincia = parts.length > 2 ? parts[2] : "Desconocida";

    // Process and map data points
    return item.Data
      .filter(d => !d.Secreto && (!selectedYear || d.Anyo === selectedYear)) // Filter out secret records and by year
      .map(d => {
        const year = d.Anyo;
        const quarterMatch = d.Periodo.Nombre_largo.match(/Trimestre (\d)/);
        const quarter = quarterMatch ? parseInt(quarterMatch[1]) : 0;
        
        return {
          provincia,
          year,
          quarter,
          periodName: d.Periodo.Nombre_largo || '',
          shortPeriod: d.NombrePeriodo || '',
          value: d.Valor
        };
      });
  }).sort((a, b) => {
    // Sort by province, year (descending), and quarter
    const provinciaCompare = a.provincia.localeCompare(b.provincia);
    if (provinciaCompare !== 0) return provinciaCompare;
    
    const yearDiff = b.year - a.year;
    if (yearDiff !== 0) return yearDiff;
    
    return a.quarter - b.quarter;
  });

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provincia</TableHead>
            <TableHead>Año</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Nombre Periodo</TableHead>
            <TableHead className="text-right">Tasa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allProcessedData.map((d, idx) => (
            <TableRow key={`${d.provincia}-${d.year}-${d.quarter}-${idx}`}>
              <TableCell>{d.provincia}</TableCell>
              <TableCell>{d.year}</TableCell>
              <TableCell>{d.periodName}</TableCell>
              <TableCell>{d.shortPeriod}</TableCell>
              <TableCell className="text-right">
                {d.value.toFixed(2)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}