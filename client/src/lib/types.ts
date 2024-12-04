export interface DataPoint {
  Valor: number;
  Periodo: string;
  Secreto: boolean;
}

export interface INEDataItem {
  Nombre: string;
  Unidad: string;
  Data: DataPoint[];
}
