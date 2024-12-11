import express, { type Request, type Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

async function startServer() {
  try {
    const app = express();
    
    log('Iniciando servidor Express...');
    
    // Configuración básica de Express
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: false, limit: '50mb' }));
    
    log('Middleware básico configurado');

    // Logging middleware
    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      
      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
        }
      });

      next();
    });

    // Registrar rutas de la API
    registerRoutes(app);

    // Crear servidor HTTP
    const server = createServer(app);

    // Manejo global de errores
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error no manejado:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Error interno del servidor";
      res.status(status).json({ error: message });
    });

    // Configurar Vite en desarrollo o servir archivos estáticos en producción
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Iniciar el servidor
    const PORT = process.env.PORT || 5000;
    const HOST = "0.0.0.0";

    server.listen(Number(PORT), HOST, () => {
      log(`Servidor iniciado en http://${HOST}:${PORT}`);
      log(`Servidor WebSocket disponible en ws://${HOST}:${PORT}/ws`);
      log('Estado del servidor: Listo para recibir conexiones');
    });

    // Manejar errores del servidor
    server.on('error', (error: Error) => {
      console.error('Error en el servidor:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer().catch((error) => {
  console.error('Error al iniciar la aplicación:', error);
  process.exit(1);
});
