interface Periodo {
  Anyo: number;
  Nombre_largo: string;
  NombrePeriodo: string;
}

export interface DataPoint {
  Valor: number;
  Periodo: Periodo;
  Secreto: boolean;
  Anyo: number;
  NombrePeriodo: string;
}

export interface INEDataItem {
  Nombre: string;
  Unidad: string;
  Data: DataPoint[];
}
