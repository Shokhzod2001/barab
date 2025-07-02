// auth-middleware.ts
import { Request, Response, NextFunction } from "express";
import AuthService from "../models/Auth.service";

const authService = new AuthService();

// Extend Express types to include member in locals
declare global {
  namespace Express {
    interface Locals {
      member?: any; // You can replace 'any' with your actual Member type
    }
  }
}

// Global member check middleware
export const setMemberLocals = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies["accessToken"];
  let member = null;

  if (token) {
    try {
      member = await authService.checkAuth(token);
      console.log("Authentication check - Member found:", member?._id);
    } catch (err) {
      console.log("Invalid or expired token:", err);
      res.clearCookie("accessToken");
    }
  } else {
    console.log("No access token found in cookies");
  }

  res.locals.member = member;
  next();
};

// Authentication guard middleware for protected routes
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.log("requireAuth middleware - checking member:", !!res.locals.member);

  if (!res.locals.member) {
    console.log("Access denied - no authenticated member");

    // For admin routes
    if (req.path.startsWith("/admin/")) {
      // If it's an AJAX request or expects JSON, return JSON
      if (
        req.xhr ||
        (req.headers.accept && req.headers.accept.indexOf("json") > -1)
      ) {
        res.status(401).json({
          message: "You are not authenticated, Please login first!",
          redirect: "/admin/login",
        });
        return;
      }

      // Otherwise redirect to login
      res.redirect("/admin/login");
      return;
    }

    // For API routes, return JSON error
    if (req.path.startsWith("/api/")) {
      res.status(401).json({
        message: "Authentication required",
        redirect: "/admin/login",
      });
      return;
    }

    res.status(401).json({
      message: "Authentication required",
      redirect: "/admin/login",
    });
    return;
  }

  console.log("Access granted for member:", res.locals.member._id);
  next();
};

// Admin role check middleware (if needed)
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!res.locals.member) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  // Check if member has admin privileges (adjust based on your schema)
  if (
    res.locals.member.memberType !== "RESTAURANT" &&
    res.locals.member.memberType !== "ADMIN"
  ) {
    res.status(403).json({ message: "Admin privileges required" });
    return;
  }

  next();
};
