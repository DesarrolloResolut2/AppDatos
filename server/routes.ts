import type { Express } from "express";
import axios from "axios";

export function registerRoutes(app: Express) {
  // Add CORS headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

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


  app.get("/api/mortalidad-data", async (req, res) => {
    try {
      const response = await axios.get(
        "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1482?nult=4&det=2"
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener datos de mortalidad del INE" });
    }
  });
  app.get("/api/natalidad-data", async (req, res) => {
    try {
      const response = await axios.get(
        "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1470?nult=4&det=2"
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener datos de natalidad del INE" });
    }
  });
}
