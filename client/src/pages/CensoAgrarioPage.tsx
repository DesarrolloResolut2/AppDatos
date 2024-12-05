import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CensoAgrarioDataTable } from "../components/CensoAgrarioDataTable";
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

export function CensoAgrarioPage() {
  const [selectedProvincia, setSelectedProvincia] = useState<string>("todas");

  const { data, isLoading, error } = useQuery({
    queryKey: ["censoAgrarioData"],
    queryFn: async () => {
      const response = await fetch("https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/51156?nult=1");
      if (!response.ok) {
        throw new Error('Error al obtener datos del censo agrario');
      }
      const jsonData = await response.json();
      
      return processData(jsonData);
    },
  });

  const processData = (rawData: any[]) => {
    const processedData = rawData.map(item => {
      const partes = item.Nombre.split(". ");
      const provincia = partes[partes.length - 1]?.trim() || "Total Nacional";
      const esNacional = provincia === "Total Nacional";
      
      // Extraer información de superficie y personalidad jurídica
      const infoAdicional = item.Nombre.split(", ");
      const superficie = infoAdicional[1] || "Todas las superficies";
      const personalidadJuridica = infoAdicional[2] || "Todas las personalidades jurídicas";
      
      return {
        provincia: provincia,
        superficie: superficie,
        personalidadJuridica: personalidadJuridica,
        numeroExplotaciones: item.Data[0]?.Valor || 0,
        tamanoMedio: item.Data[1]?.Valor || 0,
        valor: item.Data[0]?.Valor || 0,
        esNacional: esNacional,
        secreto: item.Data[0]?.Secreto || false
      };
    });

    // Filtrar datos duplicados y ordenar por provincia
    return processedData
      .filter(item => item.provincia !== "" && item.numeroExplotaciones > 0)
      .sort((a, b) => {
        if (a.esNacional) return -1;
        if (b.esNacional) return 1;
        return a.provincia.localeCompare(b.provincia);
      });
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos del censo agrario. Por favor, inténtelo de nuevo más tarde.
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
          Censo Agrario por Tamaño de Superficie y Personalidad Jurídica
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
                  {Array.from(new Set(data?.filter(item => !item.esNacional).map(item => item.provincia) || [])).sort().map((provincia) => (
                    <SelectItem key={provincia} value={provincia}>
                      {provincia}
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
          <CensoAgrarioDataTable 
            data={data?.filter(item => selectedProvincia === "todas" || item.provincia === selectedProvincia) || []} 
          />
        )}
      </div>
    </div>
  );
}
