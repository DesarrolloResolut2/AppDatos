import axios from "axios";
import type { INEDataItem, CensoDataItem, DataPoint } from "./types";

const TASAS_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3996?nult=4&det=2";
const CENSO_API_URLS = {
  general: "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/2877?nult=4&det=2",
  caceres: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2863?nult=4&det=2",
  badajoz: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2859?nult=4&det=2",
  soria: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2896?nult=4&det=2",
  teruel: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2899?nult=4&det=2",
  huesca: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2875?nult=4&det=2",
  lleida: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2878?nult=4&det=2"
};
const MUNICIPIOS_API_URL = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/61399?nult=4&det=2";
const MORTALIDAD_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1482?nult=4&det=2";

const NATALIDAD_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1469?nult=4&det=2";
const PIB_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/67284?nult=4&det=2";
export async function fetchINEData(): Promise<INEDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(TASAS_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching INE data:", error);
    throw new Error("Error al obtener datos del INE");
  }
}

export async function fetchCensoData(): Promise<CensoDataItem[]> {
  try {
    // Fetch data from all URLs
    const [generalResponse, caceresResponse, badajozResponse, soriaResponse, teruelResponse, huescaResponse, lleidaResponse] = await Promise.all([
      axios.get<INEDataItem[]>(CENSO_API_URLS.general),
      axios.get<INEDataItem[]>(CENSO_API_URLS.caceres),
      axios.get<INEDataItem[]>(CENSO_API_URLS.badajoz),
      axios.get<INEDataItem[]>(CENSO_API_URLS.soria),
      axios.get<INEDataItem[]>(CENSO_API_URLS.teruel),
      axios.get<INEDataItem[]>(CENSO_API_URLS.huesca),
      axios.get<INEDataItem[]>(CENSO_API_URLS.lleida)
    ]);

    // Process general census data
    const generalData = generalResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      const nombreLimpio = nombrePartes[0];
      const tipo: 'provincia' | 'municipio' = nombrePartes[1] === "Total" ? "provincia" : "municipio";
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'León' as const
      };
    });

    // Process Cáceres data
    const caceresData = caceresResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Cáceres' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Cáceres' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Cáceres' as const
      };
    });

    // Process Badajoz data
    const badajozData = badajozResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Badajoz' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Badajoz' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Badajoz' as const
      };
    });

    // Process Soria data
    const soriaData = soriaResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Soria' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Soria' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Soria' as const
      };
    });

    // Process Teruel data
    const teruelData = teruelResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Teruel' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Teruel' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Teruel' as const
      };
    });

    // Process Huesca data
    const huescaData = huescaResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Huesca' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Huesca' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Huesca' as const
      };
    });

    // Combine all datasets
    // Process Lleida data
    const lleidaData = lleidaResponse.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      let tipo: 'provincia' | 'municipio' = "municipio";
      let nombreLimpio = nombrePartes[0];

      // Si el nombre es 'Lleida' y contiene 'Total habitantes', es un dato provincial
      if (nombreLimpio === 'Lleida' && item.Nombre.includes('Total habitantes')) {
        tipo = 'provincia';
      }
      
      let genero: 'Total' | 'Hombres' | 'Mujeres' = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero,
        provincia: 'Lleida' as const
      };
    });

    return [...generalData, ...caceresData, ...badajozData, ...soriaData, ...teruelData, ...huescaData, ...lleidaData];
  } catch (error) {
    console.error("Error fetching censo data:", error);
    throw new Error("Error al obtener datos del censo");
  }
}
export interface MortalidadDataItem {
  provincia: string;
  year: number;
  valor: number;
}

export async function fetchMortalidadData(): Promise<MortalidadDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(MORTALIDAD_API_URL);
    return response.data.map(item => {
      const parts = item.Nombre.split(".");
      const provincia = parts[1]?.trim() || "Desconocida";
      
      return item.Data
        .filter(d => !d.Secreto)
        .map(d => ({
          provincia,
          year: d.Anyo,
          valor: d.Valor
        }));
    }).flat();
  } catch (error) {
    console.error("Error fetching mortalidad data:", error);
    throw new Error("Error al obtener datos de mortalidad");
  }
}
export interface NatalidadDataItem {
  provincia: string;
  year: number;
  valor: number;
}

export async function fetchNatalidadData(): Promise<NatalidadDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(NATALIDAD_API_URL);
    return response.data.flatMap(item => {
      // El nombre viene en formato "Tasa Bruta de Natalidad. Nombre de Provincia"
      const parts = item.Nombre.split(".");
      const provincia = parts[1]?.trim() || "Desconocida";
      
      return item.Data
        .filter(d => !d.Secreto)
        .map(d => ({
          provincia,
          year: d.Anyo,
          valor: d.Valor
        }));
    });
  } catch (error) {
    console.error("Error fetching natalidad data:", error);
    throw new Error("Error al obtener datos de natalidad");
  }
}
export interface MunicipiosDataItem extends INEDataItem {
  clasificacion: string;
  provincia: string;
}

export async function fetchMunicipiosData(): Promise<MunicipiosDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(MUNICIPIOS_API_URL);
    return response.data.map(item => {
      const nombrePartes = item.Nombre.split(", ");
      const [codigoProvincia, clasificacion] = nombrePartes;
      const provincia = codigoProvincia.split(" ").slice(1).join(" "); // Elimina el código numérico
      
      return {
        ...item,
        clasificacion,
        provincia
      };
    });
  } catch (error) {
    console.error("Error fetching municipios data:", error);
    throw new Error("Error al obtener datos de municipios");
  }
}
export interface PIBDataItem extends INEDataItem {
  provincia: string;
  categoria: string;
  tipo: 'general' | 'industria';
}

export async function fetchPIBData(): Promise<PIBDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(PIB_API_URL);
    return response.data.map(item => {
      const parts = item.Nombre.split(", ");
      const provincia = parts[0];
      const categoria = parts[1];
      const tipo = categoria.startsWith("PRODUCTO INTERIOR BRUTO") ? 'general' : 'industria';
      
      return {
        ...item,
        provincia,
        categoria,
        tipo
      };
    });
  } catch (error) {
    console.error("Error fetching PIB data:", error);
    throw new Error("Error al obtener datos del PIB");
  }
}
export interface ImportedDataResponse {
  id: number;
  fileName: string;
  sheetName: string;
  data: any[];
  importedAt: string;
}

export async function fetchImportedData(): Promise<ImportedDataResponse[]> {
  try {
    const response = await axios.get<ImportedDataResponse[]>('/api/imported-data');
    return response.data;
  } catch (error) {
    console.error("Error fetching imported data:", error);
    throw new Error("Error al obtener los datos importados");
  }
}
export async function deleteImportedData(id: number): Promise<void> {
  try {
    await axios.delete(`/api/imported-data/${id}`);
  } catch (error) {
    console.error("Error deleting imported data:", error);
    throw new Error("Error al eliminar el archivo");
  }
}
