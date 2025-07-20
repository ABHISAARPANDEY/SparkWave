import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check session for authenticated user
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ 
      message: "Authentication required. Please log in to continue." 
    });
  }
  
  req.userId = userId;
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  // Optional authentication - sets userId if available but doesn't require it
  const userId = req.session?.userId;
  
  if (userId) {
    req.userId = userId;
  }
  
  next();
}

export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // In a real application, you would check user roles from database
    // For now, we'll assume all authenticated users have the required role
    next();
  };
}

export function rateLimitByUser(maxRequests: number, windowMs: number) {
  const userRequests = new Map<number, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const now = Date.now();
    const userLimit = userRequests.get(req.userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or create new limit window
      userRequests.set(req.userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        message: "Rate limit exceeded. Please try again later.",
        resetTime: new Date(userLimit.resetTime).toISOString(),
      });
    }
    
    userLimit.count++;
    next();
  };
}

// Middleware to validate API keys for external services
export function validateApiKeys(requiredKeys: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingKeys = requiredKeys.filter(key => !process.env[key]);
    
    if (missingKeys.length > 0) {
      console.error(`Missing required environment variables: ${missingKeys.join(', ')}`);
      return res.status(500).json({ 
        message: "Service configuration error. Please contact support.",
        error: process.env.NODE_ENV === 'development' ? `Missing: ${missingKeys.join(', ')}` : undefined
      });
    }
    
    next();
  };
}
