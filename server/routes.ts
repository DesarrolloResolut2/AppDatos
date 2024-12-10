import { type Express, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import axios from "axios";
import { db } from "../db";
import { importedData, pdfDocuments } from "../db/schema";
const pdfParse = require('pdf-parse');

// Configuración básica para pdf-parse
const PDF_PARSE_OPTIONS = {
  pagerender: function(pageData: { getTextContent: () => any; }) {
    try {
      return pageData.getTextContent();
    } catch (error) {
      console.error('Error al renderizar página:', error);
      return null;
    }
  }
};

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

  // PDF Document Routes
  app.post("/api/pdf-documents", async (req: Request, res: Response) => {
    try {
      const { fileName, fileContent, fileSize, mimeType } = req.body;

      if (!fileName || !fileContent || !fileSize || !mimeType) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
      }

      if (mimeType !== 'application/pdf') {
        return res.status(400).json({ error: "El archivo debe ser un PDF" });
      }

      // Guardamos el contenido en base64 directamente
      const result = await db.insert(pdfDocuments).values({
        fileName,
        fileContent: fileContent,  // contenido en base64
        fileSize,
        mimeType,
      }).returning();

      res.json({ 
        message: "PDF guardado correctamente",
        document: result[0]
      });
    } catch (error) {
      console.error("Error al guardar PDF:", error);
      res.status(500).json({ 
        error: "Error al guardar el PDF",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  app.get("/api/pdf-documents", async (_req: Request, res: Response) => {
    try {
      const result = await db.select({
        id: pdfDocuments.id,
        fileName: pdfDocuments.fileName,
        fileSize: pdfDocuments.fileSize,
        uploadedAt: pdfDocuments.uploadedAt,
      }).from(pdfDocuments).orderBy(pdfDocuments.uploadedAt);
      
      res.json(result);
    } catch (error) {
      console.error("Error al obtener PDFs:", error);
      res.status(500).json({ 
        error: "Error al obtener los PDFs",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  app.get("/api/pdf-documents/:id/content", async (req: Request, res: Response) => {
    try {
      console.log(`Iniciando procesamiento de PDF ID: ${req.params.id}`);
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.error(`ID inválido: ${req.params.id}`);
        return res.status(400).json({ error: "ID inválido" });
      }

      console.log('Buscando documento en la base de datos...');
      const document = await db.select().from(pdfDocuments).where(eq(pdfDocuments.id, id)).limit(1);
      
      if (!document.length) {
        console.error(`PDF no encontrado con ID: ${id}`);
        return res.status(404).json({ error: "PDF no encontrado" });
      }

      try {
        console.log(`Procesando PDF: ${document[0].fileName}`);
        
        // Validar contenido base64
        if (!document[0].fileContent) {
          throw new Error('Contenido del PDF no encontrado en la base de datos');
        }

        // Crear buffer desde base64
        const buffer = Buffer.from(document[0].fileContent, 'base64');
        console.log(`Buffer creado, tamaño: ${buffer.length} bytes`);
        
        if (buffer.length === 0) {
          throw new Error('Buffer vacío después de la conversión base64');
        }

        // Procesar PDF
        console.log('Iniciando parseado del PDF...');
        const data = await pdfParse(buffer, PDF_PARSE_OPTIONS);
        console.log('PDF parseado exitosamente');

        // Validar resultado
        if (!data || typeof data.text !== 'string') {
          throw new Error('Resultado del parseo inválido');
        }

        const response = {
          fileName: document[0].fileName,
          text: data.text || 'No se pudo extraer texto',
          numPages: data.numpages || 1,
          info: data.info || {}
        };

        console.log(`PDF procesado correctamente: ${response.numPages} páginas`);
        res.json(response);
      } catch (parseError) {
        console.error("Error detallado al parsear el PDF:", parseError);
        res.status(500).json({ 
          error: "Error al procesar el contenido del PDF",
          details: parseError instanceof Error ? parseError.message : "Error desconocido"
        });
      }
    } catch (error) {
      console.error("Error general al obtener contenido del PDF:", error);
      res.status(500).json({ 
        error: "Error al extraer el contenido del PDF",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  app.delete("/api/pdf-documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await db.delete(pdfDocuments).where(eq(pdfDocuments.id, id));
      res.json({ message: "PDF eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar PDF:", error);
      res.status(500).json({ 
        error: "Error al eliminar el PDF",
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
}