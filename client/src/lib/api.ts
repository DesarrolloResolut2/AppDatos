import axios from "axios";
import type { INEDataItem } from "./types";

const TASAS_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3996?nult=4&det=2";
const CENSO_API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/2877?nult=4&det=2";
const MUNICIPIOS_API_URL = "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/61399?nult=4&det=2";

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
    const response = await axios.get<INEDataItem[]>(CENSO_API_URL);
    return response.data.map(item => {
      const nombrePartes = item.Nombre.split(". ");
      const nombreLimpio = nombrePartes[0];
      const tipo = nombrePartes[1] === "Total" ? "provincia" : "municipio";
      
      // Extraer el género del nombre completo
      let genero = 'Total';
      if (item.Nombre.includes('Hombres')) {
        genero = 'Hombres';
      } else if (item.Nombre.includes('Mujeres')) {
        genero = 'Mujeres';
      }
      
      return {
        ...item,
        tipo,
        nombreLimpio,
        genero
      };
    });
  } catch (error) {
    console.error("Error fetching censo data:", error);
    throw new Error("Error al obtener datos del censo");
  }
}
export interface MunicipiosDataItem extends INEDataItem {
  clasificacion: string;
}

export async function fetchMunicipiosData(): Promise<MunicipiosDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(MUNICIPIOS_API_URL);
    return response.data.map(item => {
      const nombrePartes = item.Nombre.split(", ");
      const clasificacion = nombrePartes[1] || "";
      
      return {
        ...item,
        clasificacion
      };
    });
  } catch (error) {
    console.error("Error fetching municipios data:", error);
    throw new Error("Error al obtener datos de municipios");
  }
}
