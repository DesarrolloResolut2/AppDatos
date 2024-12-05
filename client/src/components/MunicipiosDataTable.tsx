import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MunicipiosDataItem } from "../lib/api";

interface MunicipiosDataTableProps {
  data: MunicipiosDataItem[];
}

export function MunicipiosDataTable({ data }: MunicipiosDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provincia</TableHead>
          <TableHead>Número de Habitantes</TableHead>
          <TableHead>Año</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.flatMap((item) => 
          item.Data.map((dataItem) => (
            <TableRow key={`${item.provincia}-${dataItem.NombrePeriodo}`}>
              <TableCell>{item.provincia}</TableCell>
              <TableCell>{item.clasificacion}</TableCell>
              <TableCell>{dataItem.NombrePeriodo}</TableCell>
              <TableCell className="text-right">{dataItem.Valor}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
