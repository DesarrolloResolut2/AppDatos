import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MunicipiosDataTable } from "../components/MunicipiosDataTable";
import { fetchMunicipiosData } from "../lib/api";
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

export function MunicipiosPage() {
  const [selectedYear, setSelectedYear] = useState<number>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["municipiosData"],
    queryFn: fetchMunicipiosData,
  });

  // Extract unique years from data
  const years = data
    ? Array.from(
        new Set(
          data.flatMap(item => 
            item.Data
              .filter(d => d && typeof d.Anyo === 'number')
              .map(d => d.Anyo)
          )
        )
      ).sort((a, b) => b - a)
    : [];
    
  // Set initial year when data is loaded
  useEffect(() => {
    if (years.length > 0 && !selectedYear) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const filteredData = data?.sort((a, b) => {
    // Extraer números del inicio de la clasificación para ordenar correctamente
    const numA = parseInt(a.clasificacion.match(/\d+/)?.[0] || "0");
    const numB = parseInt(b.clasificacion.match(/\d+/)?.[0] || "0");
    return numA - numB;
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de municipios. Por favor, inténtelo de nuevo más tarde.
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
          Municipios por Número de Habitantes
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
                value={selectedYear?.toString() || ''}
                onValueChange={(year) => setSelectedYear(Number(year))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
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
          <MunicipiosDataTable data={filteredData || []} selectedYear={selectedYear} />
        )}
      </div>
    </div>
  );
}
