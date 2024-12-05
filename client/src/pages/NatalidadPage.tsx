import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { NatalidadDataTable } from "../components/NatalidadDataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export function NatalidadPage() {
  interface INENatalidadResponse {
    Data: {
      Anyo: number;
      Valor: number;
      Secreto: boolean;
    }[];
  }

  const { data, isLoading, error } = useQuery<{ provincia: string; year: number; valor: number }[]>({
    queryKey: ["natalidadData"],
    queryFn: async () => {
      const response = await fetch("https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1470?nult=4&det=2");
      const jsonData: INENatalidadResponse = await response.json();
      return jsonData.Data
        .filter(item => !item.Secreto)
        .map(item => ({
          provincia: "León",
          year: item.Anyo,
          valor: item.Valor
        }));
    },
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.map(item => item.year)))
        .sort((a, b) => b - a)
    : [];

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || 2023);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de natalidad. Por favor, inténtelo de nuevo más tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Volver a inicio
        </Link>
        <h1 className="text-3xl font-bold text-center flex-1">
          Tasa de Natalidad - León
        </h1>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Año
              </label>
              <Select
                value={selectedYear?.toString()}
                onValueChange={(year) => setSelectedYear(Number(year))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <NatalidadDataTable data={data || []} selectedYear={selectedYear} />
        )}
      </div>
    </div>
  );
}
