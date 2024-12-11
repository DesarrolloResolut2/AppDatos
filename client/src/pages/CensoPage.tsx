import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CensoDataTable } from "../components/CensoDataTable";
import { fetchCensoData } from "../lib/api";
import { DataPoint } from "../lib/types";
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

type ProvinciaType = 'León' | 'Cáceres' | 'Badajoz' | 'Soria' | 'Teruel' | 'Huesca' | 'Lleida' | 'todas';
type GeneroType = 'Total' | 'Hombres' | 'Mujeres';

export function CensoPage() {
  const [selectedProvincia, setSelectedProvincia] = useState<ProvinciaType>('todas');
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedGenero, setSelectedGenero] = useState<GeneroType>("Total");

  const { data, isLoading, error } = useQuery({
    queryKey: ["censoData"],
    queryFn: fetchCensoData,
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.flatMap(item => item.Data.map((d: DataPoint) => d.Anyo))))
        .sort((a, b) => b - a)
    : [];

  const filteredData = data?.filter(item => {
    // Filtrar por provincia específica o mostrar todas
    const provinciaMatch = selectedProvincia === "todas" || item.provincia === selectedProvincia;
    
    // Filtrar por género
    const generoMatch = selectedGenero === "Total" || item.genero === selectedGenero;
    
    return provinciaMatch && generoMatch;
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos del censo. Por favor, inténtelo de nuevo más tarde.
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
          Censo por Provincias
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
                onValueChange={(value: ProvinciaType) => setSelectedProvincia(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar provincia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las provincias</SelectItem>
                  <SelectItem value="León">León</SelectItem>
                  <SelectItem value="Cáceres">Cáceres</SelectItem>
                  <SelectItem value="Badajoz">Badajoz</SelectItem>
                  <SelectItem value="Soria">Soria</SelectItem>
                  <SelectItem value="Teruel">Teruel</SelectItem>
                  <SelectItem value="Huesca">Huesca</SelectItem>
                  <SelectItem value="Lleida">Lleida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Género
              </label>
              <Select
                value={selectedGenero}
                onValueChange={(value: GeneroType) => setSelectedGenero(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Total">Total</SelectItem>
                  <SelectItem value="Hombres">Hombres</SelectItem>
                  <SelectItem value="Mujeres">Mujeres</SelectItem>
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
          <CensoDataTable data={filteredData || []} selectedYear={selectedYear} />
        )}
      </div>
    </div>
  );
}