import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { NatalidadDataTable } from "../components/NatalidadDataTable";
import { fetchNatalidadData, exportProvincialData } from "../lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export function NatalidadPage() {
  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["natalidadData"],
    queryFn: fetchNatalidadData,
  });

  // Extract unique years from data
  const years = data
    ? Array.from(new Set(data.map(item => item.year)))
        .sort((a, b) => b - a)
    : [];

  const [selectedYear, setSelectedYear] = useState<number>(
    years.length > 0 ? years[0] : 2023
  );

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
              {selectedProvincia !== "todas" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={isExporting}
                  onClick={async () => {
                    try {
                      setIsExporting(true);
                      await exportProvincialData(selectedProvincia);
                      toast({
                        title: "Exportación exitosa",
                        description: `Los datos de ${selectedProvincia} han sido exportados correctamente.`,
                      });
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Error en la exportación",
                        description: "No se pudieron exportar los datos. Por favor, inténtalo de nuevo.",
                      });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar datos"}
                </Button>
              )}
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
