import type { Express } from "express";
import axios from "axios";

export function registerRoutes(app: Express) {
  app.get("/api/ine-data", async (req, res) => {
    try {
      const response = await axios.get(
        "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3996?nult=4&det=2"
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener datos del INE" });
    }
  });
}
