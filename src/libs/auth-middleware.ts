import { Request, Response, NextFunction } from "express";
import AuthService from "../models/Auth.service";

const authService = new AuthService();

// Extend Express `res.locals` type (optional: replace `any` with real `Member` type)
declare global {
  namespace Express {
    interface Locals {
      member?: any;
    }
  }
}

// === 1. Attach member to res.locals if token is valid ===
export const setMemberLocals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.accessToken;
  res.locals.member = null;

  if (token) {
    try {
      const member = await authService.checkAuth(token);
      res.locals.member = member;
      console.log("✅ Authenticated:", member?._id);
    } catch (err) {
      console.warn("❌ Invalid token:", (err as Error).message);
      res.clearCookie("accessToken");
    }
  } else {
    console.log("ℹ️ No token found");
  }

  next();
};

// === 2. Protect any route (API or Admin) ===
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const member = res.locals.member;

  if (!member) {
    console.warn("⛔ Auth denied. No member in context.");

    const isJson = req.xhr || req.headers.accept?.includes("json");
    const isAdmin = req.path.startsWith("/admin");
    const isApi = req.path.startsWith("/api");

    const redirectUrl = isAdmin ? "/admin/login" : "/login";

    if (isJson || isApi) {
      res.status(401).json({
        message: "Authentication required",
        redirect: redirectUrl,
      });
    } else {
      res.redirect(redirectUrl);
    }

    return;
  }

  console.log("✅ Access granted:", member._id);
  next();
};

// === 3. Admin role-only middleware ===
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const member = res.locals.member;

  if (!member) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  const allowedRoles = ["ADMIN", "RESTAURANT", "CHEF"]; // optionally pass this as config
  if (!allowedRoles.includes(member.memberType)) {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }

  next();
};
