import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeScheduler } from "./services/scheduler";

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://spark-wave-1-hakopog916.replit.app', 
        'http://localhost:3002', 
        'http://localhost:5173',
        process.env.FRONTEND_URL || 'http://localhost:3000',
        /\.railway\.app$/, // Allow all Railway subdomains
        /\.vercel\.app$/,  // Allow all Vercel subdomains
        /\.netlify\.app$/  // Allow all Netlify subdomains
      ]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Session configuration with proper store
const SessionStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'sparkwave-secret-key-change-in-production',
  resave: true,
  saveUninitialized: true,
  store: new SessionStore({
    checkPeriod: 86400000, // prune expired entries every 24h
    ttl: 24 * 60 * 60 * 1000 // 24 hours
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // Strict in production
  },
  name: 'sparkwave-session' // Custom session name
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    log(`Error: ${status} - ${message}`);
  });

  // Initialize the post scheduler
  await initializeScheduler();
  log("Post scheduler initialized");

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 3002 if not specified.
  const port = parseInt(process.env.PORT || '3002', 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
