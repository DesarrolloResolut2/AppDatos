import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "../components/DataTable";
import { Filters } from "../components/Filters";
import { fetchINEData } from "../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function Home() {
  const [selectedGender, setSelectedGender] = useState<string>("Hombres");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("Tasa de actividad");
  const { data, isLoading, error } = useQuery({
    queryKey: ["ineData", selectedGender, selectedIndicator],
    queryFn: () => fetchINEData(),
  });

  // Extract unique years from data
  const years = data
    ? [...new Set(data.flatMap(item => item.Data.map(d => d.Anyo)))]
        .sort((a, b) => b - a)
    : [];

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || 2023);

  const filteredData = data?.filter(
    (item) =>
      item.Nombre.includes(selectedGender) &&
      item.Nombre.includes(selectedIndicator)
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
      <h1 className="text-3xl font-bold mb-8 text-center">
        Tasas de Actividad, Paro y Empleo
      </h1>

      <div className="space-y-6">
        <Filters
          selectedGender={selectedGender}
          selectedIndicator={selectedIndicator}
          selectedYear={selectedYear}
          years={years}
          onGenderChange={setSelectedGender}
          onIndicatorChange={setSelectedIndicator}
          onYearChange={(year) => setSelectedYear(Number(year))}
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
