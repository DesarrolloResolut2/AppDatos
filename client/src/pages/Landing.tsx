import { Link } from "wouter";
import { Card } from "@/components/ui/card";
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

  const handleCategoryChange = (value: string) => {
    setLocation(value);
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
            </SelectContent>
          </Select>
        </Card>
      </div>
    </div>
  );
}
