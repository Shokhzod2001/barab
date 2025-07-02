import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";

import { MORGAN_FORMAT } from "./libs/config";
import AuthService from "./models/Auth.service";
import authRoutes from "./libs/auth";
import "./libs/passport"; // load strategies
import {
  requireAdmin,
  requireAuth,
  setMemberLocals,
} from "./libs/auth-middleware";

/** App setup **/
const app = express();
const authService = new AuthService();

/** Middleware **/
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

/** Session + Passport (OAuth) **/
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

/** Views **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** Admin Authentication Middleware **/
const protectedAdminRoutes = [
  "/admin/product",
  "/admin/order",
  "/admin/member",
];

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.accessToken;
    let member = null;

    if (token) {
      try {
        member = await authService.checkAuth(token);
      } catch (err) {
        console.warn("Invalid or expired token");
        res.clearCookie("accessToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        });
      }
    }

    res.locals.member = member;

    const needsAuth = protectedAdminRoutes.some((route) =>
      req.path.startsWith(route)
    );

    if (needsAuth && !member) {
      if (req.xhr || req.headers.accept?.includes("json")) {
        res.status(401).json({
          message: "You are not authenticated, Please login first!",
        });
        return;
      }
      res.redirect("/admin/login");
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Global middleware - attaches member info if token exists
app.use(setMemberLocals);

/** Routers **/
app.use("/auth", authRoutes);

// Apply admin middleware to all admin routes
app.use("/admin", adminMiddleware);

// Apply additional role-based middleware for specific admin routes
app.use("/admin/secure", requireAdmin); // requires ADMIN / RESTAURANT / CHEF

// Router setup
app.use("/admin", routerAdmin);
app.use("/", router); // Public SPA

export default app;
