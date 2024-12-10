import type { Express, Request, Response } from "express";
import axios from "axios";
import { db } from "../db";
import { importedData } from "../db/schema";

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

  app.post("/api/import-excel", async (req: Request, res: Response) => {
    try {
      const { data, fileName = "imported-file", sheetName = "Sheet1" } = req.body;

      if (!data) {
        return res.status(400).json({ error: "No se recibieron datos para importar" });
      }

      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Los datos deben ser un array" });
      }

      if (data.length === 0) {
        return res.status(400).json({ error: "El archivo Excel está vacío" });
      }

      // Validar que los datos sean JSON válido
      try {
        // Asegurarse de que los datos son serializables
        JSON.parse(JSON.stringify(data));
      } catch (e) {
        return res.status(400).json({ 
          error: "Los datos no son válidos para JSON",
          details: e instanceof Error ? e.message : "Error al validar JSON"
        });
      }

      // Intentar insertar en la base de datos
      const result = await db.insert(importedData).values({
        fileName,
        sheetName,
        data,
        importedAt: new Date(),
      }).returning();

      res.json({ 
        message: "Datos importados correctamente",
        importedData: result[0]
      });
    } catch (error) {
      console.error("Error al importar datos:", error);
      
      // Mejorar los mensajes de error
      let errorMessage = "Error al procesar el archivo Excel";
      let errorDetails = error instanceof Error ? error.message : "Error desconocido";
      
      if (error instanceof Error) {
        if (error.message.includes("duplicate key")) {
          errorMessage = "Este archivo ya ha sido importado";
        } else if (error.message.includes("invalid input syntax")) {
          errorMessage = "El formato de los datos no es válido";
        }
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: errorDetails
      });
    }
  });

  app.get("/api/imported-data", async (_req: Request, res: Response) => {
    try {
      const result = await db.select().from(importedData).orderBy(importedData.importedAt);
      res.json(result);
    } catch (error) {
      console.error("Error al obtener datos importados:", error);
      res.status(500).json({ 
        error: "Error al obtener los datos importados",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });
}
