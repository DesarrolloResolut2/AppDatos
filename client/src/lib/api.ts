import axios from "axios";
import type { INEDataItem } from "./types";

const API_URL = "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3996?nult=4&det=2";

export async function fetchINEData(): Promise<INEDataItem[]> {
  try {
    const response = await axios.get<INEDataItem[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching INE data:", error);
    throw new Error("Error al obtener datos del INE");
  }
}
