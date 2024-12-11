import { type Express, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import axios from "axios";
import { db } from "../db";
import { importedData } from "../db/schema";



export function registerRoutes(app: Express) {
  // Add CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  

  // Excel Import Routes
  app.post("/api/import-excel", async (req: Request, res: Response) => {
    try {
      const { data, fileName, sheetName } = req.body;

      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: "Datos inválidos" });
      }

      const result = await db.insert(importedData).values({
        fileName,
        sheetName,
        data,
      }).returning();

      res.json({ 
        message: "Datos importados correctamente",
        importedData: result[0]
      });
    } catch (error) {
      console.error("Error al importar datos:", error);
      res.status(500).json({ 
        error: "Error al importar los datos",
        details: error instanceof Error ? error.message : "Error desconocido"
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

  app.delete("/api/imported-data/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await db.delete(importedData).where(eq(importedData.id, id));
      res.json({ message: "Datos eliminados correctamente" });
    } catch (error) {
      console.error("Error al eliminar datos:", error);
      res.status(500).json({ 
        error: "Error al eliminar los datos",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  

  // INE Data Routes
  app.get("/api/ine-data", async (_req: Request, res: Response) => {
    try {
      const response = await axios.get("https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2074?nult=8");
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching INE data:", error);
      res.status(500).json({ error: "Error al obtener datos del INE" });
    }
  });

  // Natalidad Data Route
  app.get("/api/natalidad-data", async (_req: Request, res: Response) => {
    try {
      const response = await axios.get("https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1469?nult=4&det=2");
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching natalidad data:", error);
      res.status(500).json({ error: "Error al obtener datos de natalidad del INE" });
    }
  });

  // Export Provincial Data Route
  app.get("/api/export-provincial-data/:provincia", async (req: Request, res: Response) => {
    try {
      const provincia = req.params.provincia;
      console.log(`Iniciando exportación de datos para la provincia: ${provincia}`);
      
      // Definir URLs y realizar peticiones de manera más controlada
      const endpoints = {
        natalidad: "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1469?nult=4&det=2",
        actividadParoEmpleo: "https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/2074?nult=8",
        mortalidad: "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/1234?nult=4",
        censo: "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3001?nult=1",
        pib: "https://servicios.ine.es/wstempus/jsCache/ES/DATOS_TABLA/3002?nult=1"
      };

      const fetchData = async (url: string, categoria: string) => {
        try {
          console.log(`Obteniendo datos de ${categoria} desde ${url}`);
          const response = await axios.get(url);
          if (!response.data) {
            console.log(`No se encontraron datos para ${categoria}`);
            return [];
          }
          return response.data;
        } catch (error) {
          console.error(`Error al obtener datos de ${categoria}:`, error);
          return [];
        }
      };

      // Obtener datos de manera secuencial para mejor control de errores
      const results = await Promise.all(
        Object.entries(endpoints).map(async ([key, url]) => {
          const data = await fetchData(url, key);
          return [key, data];
        })
      );

      // Construir objeto de datos provinciales
      const provincialData = {
        provincia,
        fecha_exportacion: new Date().toISOString(),
        ...Object.fromEntries(
          results.map(([key, data]) => [
            key,
            Array.isArray(data) ? data.filter((item: any) => 
              item.Nombre && item.Nombre.toLowerCase().includes(provincia.toLowerCase())
            ) : []
          ])
        )
      };

      console.log(`Datos filtrados para ${provincia}:`, {
        totalNatalidad: provincialData.natalidad?.length || 0,
        totalActividad: provincialData.actividadParoEmpleo?.length || 0,
        totalMortalidad: provincialData.mortalidad?.length || 0,
        totalCenso: provincialData.censo?.length || 0,
        totalPib: provincialData.pib?.length || 0
      });

      // Generar nombre del archivo
      const fileName = `datos_${provincia.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      
      // Configurar headers para la descarga
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      
      res.json(provincialData);
    } catch (error) {
      console.error("Error general en la exportación de datos provinciales:", error);
      res.status(500).json({ 
        error: "Error al exportar datos provinciales",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });
}