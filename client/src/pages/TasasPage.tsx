import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../components/DataTable";
import { Filters } from "../components/Filters";
import { fetchINEData } from "../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function TasasPage() {
  const [selectedGender, setSelectedGender] = useState<string>("Hombres");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("Tasa de actividad");
  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");
  const { data, isLoading, error } = useQuery({
    queryKey: ["ineData", selectedGender, selectedIndicator],
    queryFn: () => fetchINEData(),
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.flatMap(item => item.Data.map(d => d.Anyo))))
        .sort((a, b) => b - a)
    : [];

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || 2023);

  // Extract unique provincias from data
  const provincias = data
    ? Array.from(new Set(data.map(item => {
        const parts = item.Nombre.split(". ");
        return parts.length > 2 ? parts[2] : null;
      }).filter(Boolean)))
        .sort()
    : [];

  const filteredData = data?.filter(
    (item) => {
      const parts = item.Nombre.split(". ");
      const provincia = parts.length > 2 ? parts[2] : "";
      return item.Nombre.includes(selectedGender) &&
             item.Nombre.includes(selectedIndicator) &&
             (selectedProvincia === "todas" || provincia === selectedProvincia);
    }
  );

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos. Por favor, inténtelo de nuevo más tarde.
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
          Tasas de Actividad, Paro y Empleo
        </h1>
      </div>

      <div className="space-y-6">
        <Filters
          selectedGender={selectedGender}
          selectedIndicator={selectedIndicator}
          selectedYear={selectedYear}
          selectedProvincia={selectedProvincia}
          years={years}
          provincias={provincias}
          onGenderChange={setSelectedGender}
          onIndicatorChange={setSelectedIndicator}
          onYearChange={(year) => setSelectedYear(Number(year))}
          onProvinciaChange={setSelectedProvincia}
        />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <DataTable data={filteredData || []} selectedYear={selectedYear} />
        )}
      </div>
    </div>
  );
}
