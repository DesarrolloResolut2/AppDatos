import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface CensoAgrarioDataItem {
  provincia: string;
  superficie: string;
  personalidadJuridica: string;
  numeroExplotaciones: number;
  tamanoMedio: number | null;
  valor: number | null;
  esNacional: boolean;
  secreto: boolean;
}

interface CensoAgrarioDataTableProps {
  data: CensoAgrarioDataItem[];
}

export function CensoAgrarioDataTable({ data }: CensoAgrarioDataTableProps) {
  const formatValue = (value: number | null, secreto: boolean) => {
    if (secreto) return "Secreto";
    if (value === null) return "Dato no disponible";
    return new Intl.NumberFormat('es-ES').format(value);
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provincia</TableHead>
            <TableHead>Superficie</TableHead>
            <TableHead>Personalidad Jurídica</TableHead>
            <TableHead className="text-right">Nº Explotaciones</TableHead>
            <TableHead className="text-right">Tamaño Medio (ha)</TableHead>
            <TableHead className="text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow 
              key={`${item.provincia}-${item.superficie}-${item.personalidadJuridica}-${idx}`}
              className={item.esNacional ? 'font-medium bg-muted/30' : ''}
            >
              <TableCell>{item.provincia}</TableCell>
              <TableCell>{item.superficie}</TableCell>
              <TableCell>{item.personalidadJuridica}</TableCell>
              <TableCell className="text-right">
                {formatValue(item.numeroExplotaciones, item.secreto)}
              </TableCell>
              <TableCell className="text-right">
                {formatValue(item.tamanoMedio, item.secreto)}
              </TableCell>
              <TableCell className="text-right">
                {formatValue(item.valor, item.secreto)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
