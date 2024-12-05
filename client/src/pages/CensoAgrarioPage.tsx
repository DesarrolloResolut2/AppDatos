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
  const { data, isLoading, error } = useQuery({
    queryKey: ["censoAgrarioData"],
    queryFn: async () => {
      const response = await fetch("https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/51156");
      if (!response.ok) {
        throw new Error('Error al obtener datos del censo agrario');
      }
      const jsonData = await response.json();
      console.log('Datos recibidos:', jsonData);
      return processData(jsonData);
    },
  });

  const processData = (rawData: any[]) => {
    const processedData = rawData.map(item => {
      const nombreCompleto = item.Nombre;
      const partes = nombreCompleto.split(".");
      const provincia = partes.length > 1 ? partes[partes.length - 1].trim() : "Total Nacional";
      
      const categorias = nombreCompleto.split(",");
      const superficie = categorias.length > 1 ? categorias[1].trim() : "Total";
      const personalidadJuridica = categorias.length > 2 ? categorias[2].trim() : "Total";
      
      return {
        provincia,
        superficie,
        personalidadJuridica,
        numeroExplotaciones: item.Data[0]?.Valor || 0,
        tamanoMedio: item.Data[1]?.Valor || 0,
        valor: item.Data[0]?.Valor || 0,
        esNacional: provincia === "Total Nacional",
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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <CensoAgrarioDataTable data={data || []} />
        )}
      </div>
    </div>
  );
}
