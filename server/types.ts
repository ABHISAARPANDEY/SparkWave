import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export {};