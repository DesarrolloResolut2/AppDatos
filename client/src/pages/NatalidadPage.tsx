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
    Nombre: string;
    Data: Array<{
      Anyo: number;
      Valor: number;
      Secreto: boolean;
      Nombre: string;
    }>;
  }

  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");

  const { data, isLoading, error } = useQuery<{ provincia: string; year: number; valor: number }[]>({
    queryKey: ["natalidadData"],
    queryFn: async () => {
      const response = await fetch("/api/natalidad-data");
      if (!response.ok) {
        throw new Error('Error al obtener datos de natalidad');
      }
      const jsonData = await response.json();
      const processedData: { provincia: string; year: number; valor: number }[] = [];
      
      jsonData.forEach((item: INENatalidadResponse) => {
        const parts = item.Nombre.split(".");
        const provincia = parts[1]?.trim() || "Desconocida";
        
        item.Data
          .filter(d => !d.Secreto)
          .forEach(d => {
            processedData.push({
              provincia,
              year: d.Anyo,
              valor: d.Valor
            });
          });
      });
      
      return processedData;
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
          Tasa de Natalidad por Provincias
        </h1>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Provincia
              </label>
              <Select
                value={selectedProvincia}
                onValueChange={setSelectedProvincia}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las provincias</SelectItem>
                  {Array.from(new Set(data?.map(item => item.provincia) || [])).sort().map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          <NatalidadDataTable 
            data={data?.filter(item => selectedProvincia === "todas" || item.provincia === selectedProvincia) || []} 
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
}
