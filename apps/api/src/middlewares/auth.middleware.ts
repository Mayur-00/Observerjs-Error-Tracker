import { Request, Response, NextFunction } from "express";

import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import { sdkSessionObj } from "./types.js";

// Extend Express Request interface so TypeScript recognizes user & session
declare global {
  namespace Express {
    interface Request {
      user?: typeof auth.$Infer.Session.user;
      session?: typeof auth.$Infer.Session.session;
      sdkSession?:sdkSessionObj
    }
  }
}

/**
 * Middleware to check if the user is authenticated via Better Auth
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Fetch session using Better Auth's server API, converting Node headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized: No active session found" });
    }

    // Attach user and session data to the request object for downstream controllers
    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error during authentication" });
  }
};

// /**
//  * Optional: Role-based authorization middleware factory
//  * @param allowedRoles Array of strings specifying who can access the route
//  */
// export const requireRole = (allowedRoles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     // Ensure requireAuth ran prior to this
//     if (!req.user) {
//       return res.status(401).json({ error: "Unauthorized: Context missing" });
//     }

//     // Assuming you have a 'role' property on your Better Auth user schema/plugin
//     const userRole = (req.user as any).role;

//     if (!userRole || !allowedRoles.includes(userRole)) {
//       return res.status(403).json({ error: "Forbidden: You do not have the required permissions" });
//     }

//     next();
//   };
// };