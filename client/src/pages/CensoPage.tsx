import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CensoDataTable } from "../components/CensoDataTable";
import { fetchCensoData } from "../lib/api";
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

export function CensoPage() {
  const [selectedTipo, setSelectedTipo] = useState<'provincia' | 'municipio'>('provincia');
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");
  const [selectedGenero, setSelectedGenero] = useState<string>("Total");

  const { data, isLoading, error } = useQuery({
    queryKey: ["censoData"],
    queryFn: fetchCensoData,
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.flatMap(item => item.Data.map(d => d.Anyo))))
        .sort((a, b) => b - a)
    : [];

  // Extract unique provincias
  const provincias = data
    ? Array.from(new Set(data
        .filter(item => item.tipo === 'provincia')
        .map(item => item.nombreLimpio)))
        .sort()
    : [];

  const filteredData = data?.filter(item => {
    // Filtrar por tipo (provincia o municipio)
    const tipoMatch = item.tipo === selectedTipo;
    
    // Filtrar por provincia específica o mostrar todas
    const provinciaMatch = selectedProvincia === "todas" || item.nombreLimpio === selectedProvincia;
    
    // Filtrar por género, permitiendo ver el total o un género específico
    const generoMatch = selectedGenero === "Total" || item.genero === selectedGenero;
    
    // Todos los filtros deben coincidir
    return tipoMatch && provinciaMatch && generoMatch;
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
      <h1 className="text-3xl font-bold mb-8 text-center">
        Censo por {selectedTipo === 'provincia' ? 'Provincias' : 'Municipios'}
      </h1>

      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Tipo
              </label>
              <Select
                value={selectedTipo}
                onValueChange={(value: 'provincia' | 'municipio') => {
                  setSelectedTipo(value);
                  setSelectedProvincia(""); // Reset provincia when changing tipo
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="provincia">Provincias</SelectItem>
                  <SelectItem value="municipio">Municipios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTipo === 'provincia' && (
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
                    <SelectItem value="todas">Todas</SelectItem>
                    {provincias.map((provincia) => (
                      <SelectItem key={provincia} value={provincia}>
                        {provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Género
              </label>
              <Select
                value={selectedGenero}
                onValueChange={setSelectedGenero}
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
                value={selectedYear?.toString() || ''}
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
