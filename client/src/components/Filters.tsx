import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface FiltersProps {
  selectedGender: string;
  selectedIndicator: string;
  onGenderChange: (value: string) => void;
  onIndicatorChange: (value: string) => void;
}

export function Filters({
  selectedGender,
  selectedIndicator,
  onGenderChange,
  onIndicatorChange,
}: FiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Género
          </label>
          <Select value={selectedGender} onValueChange={onGenderChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hombres">Hombres</SelectItem>
              <SelectItem value="Mujeres">Mujeres</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Indicador
          </label>
          <Select value={selectedIndicator} onValueChange={onIndicatorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar indicador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tasa de actividad">Tasa de actividad</SelectItem>
              <SelectItem value="Tasa de paro">Tasa de paro</SelectItem>
              <SelectItem value="Tasa de empleo">Tasa de empleo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
