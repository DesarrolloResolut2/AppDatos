import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportProvincialData } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";

export function Landing() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const handleCategoryChange = (value: string) => {
    setLocation(value);
  };

  const handleProvinciaChange = (value: string) => {
    setSelectedProvincia(value);
  };

  const handleExportData = async () => {
    if (!selectedProvincia) return;
    
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
  };

  return (
    <div className="container mx-auto py-16">
      <div className="text-center space-y-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Datos Estadísticos del INE
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Explora los datos estadísticos oficiales del Instituto Nacional de Estadística
        </p>

        <div className="space-y-4">
          <Card className="p-6 shadow-lg">
            <label className="text-sm font-medium mb-2 block">
              Selecciona una categoría
            </label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elige una categoría para explorar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/tasas">Tasas de actividad, paro y empleo</SelectItem>
                <SelectItem value="/censo">Censo por provincias</SelectItem>
                <SelectItem value="/municipios">Municipios por habitante</SelectItem>
                <SelectItem value="/natalidad">Tasa de natalidad</SelectItem>
                <SelectItem value="/mortalidad">Tasa de mortalidad</SelectItem>
                <SelectItem value="/pib">Tasa P.I.B a precios de mercado</SelectItem>
                <SelectItem value="/importar">Importar datos Excel</SelectItem>
                <SelectItem value="/importados">Ver archivos importados</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-6 shadow-lg">
            <label className="text-sm font-medium mb-2 block">
              Exportar datos por provincia
            </label>
            <div className="space-y-4">
              <Select onValueChange={handleProvinciaChange} value={selectedProvincia}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una provincia para exportar datos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="León">León</SelectItem>
                  <SelectItem value="Cáceres">Cáceres</SelectItem>
                  <SelectItem value="Badajoz">Badajoz</SelectItem>
                  <SelectItem value="Soria">Soria</SelectItem>
                  <SelectItem value="Teruel">Teruel</SelectItem>
                  <SelectItem value="Huesca">Huesca</SelectItem>
                  <SelectItem value="Lleida">Lleida</SelectItem>
                  <SelectItem value="Jaén">Jaén</SelectItem>
                  <SelectItem value="Asturias">Asturias</SelectItem>
                  <SelectItem value="Guadalajara">Guadalajara</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedProvincia && (
                <Button 
                  className="w-full"
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar datos de " + selectedProvincia}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
