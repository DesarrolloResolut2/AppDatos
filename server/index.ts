import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer } from "http";
import { WebSocket, WebSocketServer } from 'ws';

function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [express] ${message}`);
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Configurar CORS para HTTP y WebSocket
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  registerRoutes(app);
  const server = createServer(app);

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0";
  const WEBSOCKET_PATH = '/ws';
  
  server.listen(Number(PORT), HOST, () => {
    log(`Server running at http://${HOST}:${PORT}`);
    log(`WebSocket server available at ws://${HOST}:${PORT}${WEBSOCKET_PATH}`);
    
    // Configurar WebSocket Server con CORS después de que el servidor esté escuchando
    const wss = new WebSocketServer({ 
      noServer: true,
      perMessageDeflate: false
    });
    
    // Manejar el upgrade de la conexión HTTP a WebSocket
    server.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
      
      if (pathname === WEBSOCKET_PATH) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    });
    
    wss.on('connection', (ws: WebSocket) => {
      log('Cliente WebSocket conectado');
      
      ws.on('error', (error) => {
        console.error('Error de WebSocket:', error);
      });
      
      ws.on('message', (data) => {
        try {
          console.log('Mensaje recibido:', data.toString());
        } catch (error) {
          console.error('Error al procesar mensaje:', error);
        }
      });
      
      ws.on('close', () => {
        log('Cliente WebSocket desconectado');
      });
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();
