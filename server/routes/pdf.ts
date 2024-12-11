import express from 'express';
import * as multer from 'multer';
import { default as pdfParse } from 'pdf-parse';
import { Request, Response } from 'express';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();
const upload = multer.default({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/upload', upload.single('pdf'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    // Procesamiento básico del texto para identificar tablas
    const lines = data.text.split('\n').filter((line: string) => line.trim());
    
    // Asumimos que la primera línea contiene los encabezados
    const headers = lines[0].split(/\s+/).filter(Boolean);
    
    // El resto son filas de datos
    const rows = lines.slice(1).map((line: string) => 
      line.split(/\s+/).filter(Boolean)
    ).filter((row: string[]) => row.length === headers.length);

    return res.json({
      headers,
      rows
    });
  } catch (error) {
    console.error('Error al procesar PDF:', error);
    return res.status(500).json({ 
      error: 'Error al procesar el archivo PDF' 
    });
  }
});

export default router;
