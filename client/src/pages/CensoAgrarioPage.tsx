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
      const response = await fetch("https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/51156?nult=10");
      if (!response.ok) {
        throw new Error('Error al obtener datos del censo agrario');
      }
      const jsonData = await response.json();
      return processData(jsonData);
    },
  });

  const processData = (rawData: any[]) => {
    const processedData = rawData.map(item => {
      // Procesar el nombre para extraer la información
      const nombreCompleto = item.Nombre;
      let provincia = "Total Nacional";
      let superficie = "Todas las superficies";
      let personalidadJuridica = "Todas las personalidades jurídicas";

      if (nombreCompleto.includes(".")) {
        const partes = nombreCompleto.split(".");
        provincia = partes[partes.length - 1].trim();
      }

      const partesSeparadas = nombreCompleto.split(",").map((p: string) => p.trim());
      if (partesSeparadas.length > 1) {
        superficie = partesSeparadas[1];
        if (partesSeparadas.length > 2) {
          personalidadJuridica = partesSeparadas[2];
        }
      }

      const esNacional = provincia === "Total Nacional";
      
      // Procesar los datos
      const dataPoint = {
        provincia,
        superficie,
        personalidadJuridica,
        numeroExplotaciones: 0,
        tamanoMedio: 0,
        valor: 0,
        esNacional,
        secreto: false
      };

      // Asignar valores si están disponibles
      if (item.Data && item.Data.length > 0) {
        dataPoint.numeroExplotaciones = item.Data[0]?.Valor || 0;
        dataPoint.valor = item.Data[0]?.Valor || 0;
        dataPoint.secreto = item.Data[0]?.Secreto || false;
        if (item.Data.length > 1) {
          dataPoint.tamanoMedio = item.Data[1]?.Valor || 0;
        }
      }

      return dataPoint;
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
