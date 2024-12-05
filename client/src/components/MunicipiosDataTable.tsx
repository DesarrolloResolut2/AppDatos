import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MunicipiosDataItem } from "../lib/api";

interface MunicipiosDataTableProps {
  data: MunicipiosDataItem[];
  selectedYear: number;
}

export function MunicipiosDataTable({ data, selectedYear }: MunicipiosDataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Clasificación</TableHead>
          <TableHead className="text-right">Número de Municipios</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const yearData = item.Data.find((d) => d.Anyo === selectedYear);
          const valor = yearData?.Valor || 0;

          return (
            <TableRow key={item.clasificacion}>
              <TableCell>{item.clasificacion}</TableCell>
              <TableCell className="text-right">{valor}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
