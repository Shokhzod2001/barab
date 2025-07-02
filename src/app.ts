import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { MORGAN_FORMAT } from "./libs/config";
import AuthService from "./models/Auth.service";

// OAuth imports
import passport from "passport";
import session from "express-session";
import authRoutes from "./libs/auth";
import "./libs/passport";

/** 1 - ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("./uploads"));
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(MORGAN_FORMAT));

// Add session middleware for OAuth (before passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Add passport middleware for OAuth
app.use(passport.initialize());
app.use(passport.session());

/** 2 - AUTHENTICATION MIDDLEWARE **/
const authService = new AuthService();

/** 3 - VIEWS **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4 - ROUTERS **/
app.use("/auth", authRoutes); // OAuth routes

// In your main app.ts file, replace the adminMiddleware with this:

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Debug: Log all cookies
  console.log("All cookies:", req.cookies);
  console.log("Headers:", req.headers.cookie);

  const token = req.cookies["accessToken"] || req.cookies.accessToken;
  let member = null;

  console.log("Token found:", !!token);

  if (token) {
    try {
      member = await authService.checkAuth(token);
      console.log("Admin middleware - Member found:", member?._id);
    } catch (err) {
      console.log("Invalid or expired token:", err);
      res.clearCookie("accessToken");
      // Also try clearing with different options
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
  } else {
    console.log("Admin middleware - No access token found");
  }

  res.locals.member = member;

  // Check if this is a protected route
  const protectedRoutes = ["/admin/product", "/admin/order", "/admin/member"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.path.startsWith(route)
  );

  if (isProtectedRoute && !member) {
    console.log("Access denied to protected route:", req.path);

    // If it's an AJAX request or expects JSON, return JSON
    if (
      req.xhr ||
      (req.headers.accept && req.headers.accept.indexOf("json") > -1)
    ) {
      res.status(401).json({
        message: "You are not authenticated, Please login first!",
      });
      return;
    }

    // Otherwise redirect to login
    res.redirect("/admin/login");
    return;
  }

  console.log("Admin middleware - Access granted for:", req.path);
  next();
};

// Apply the combined middleware to all admin routes
app.use("/admin", adminMiddleware);

app.use("/admin", routerAdmin); // SSR
app.use("/", router); // SPA

export default app;
