import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PIBDataTable } from "../components/PIBDataTable";
import { fetchPIBData } from "../lib/api";
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

export function PIBPage() {
  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");
  const { data, isLoading, error } = useQuery({
    queryKey: ["pibData"],
    queryFn: fetchPIBData,
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.flatMap(item => 
        item.Data.map(d => parseInt(d.NombrePeriodo.replace("(P)", "")))
      ))).sort((a, b) => b - a)
    : [];

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || 2023);

  // Extract unique provincias from data
  const provincias = data
    ? Array.from(new Set(data.map(item => item.provincia))).sort()
    : [];

  const filteredData = data?.filter(item => 
    selectedProvincia === "todas" || item.provincia === selectedProvincia
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos del PIB. Por favor, inténtelo de nuevo más tarde.
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
          Tasa P.I.B a precios de mercado
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
                  {provincias.map((provincia) => (
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
          <PIBDataTable data={filteredData || []} selectedYear={selectedYear} />
        )}
      </div>
    </div>
  );
}
