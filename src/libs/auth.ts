import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { AUTH_TIMER } from "../libs/config";
import AuthService from "../models/Auth.service";

// Extend session with custom admin flag
declare module "express-session" {
  interface SessionData {
    isAdminFlow?: boolean;
  }
}

const router = express.Router();
const authService = new AuthService();

// Constants
const GOOGLE_SCOPE = ["profile", "email"];
const ADMIN_ROLES = ["ADMIN", "RESTAURANT", "CHEF"];
const DEFAULT_REDIRECT = "/admin/product/all";

// Reusable helper
const handleAuthSuccess = async (
  req: Request,
  res: Response,
  redirectPath: string
) => {
  try {
    const user = req.user as any;
    console.log("OAuth Success - Creating token for:", {
      id: user._id,
      type: user.memberType,
      email: user.memberEmail || user.googleEmail,
    });

    const token = await authService.createToken(
      user.toObject ? user.toObject() : { ...user }
    );

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    console.log("Token set. Redirecting to:", redirectPath);
    res.redirect(redirectPath);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.send(
      `<script>alert("Authentication failed: ${error}"); window.location.replace("/login");</script>`
    );
  }
};

// ========================
// Google OAuth Entry Routes
// ========================

// Regular user
router.get(
  "/google",
  passport.authenticate("google", {
    scope: GOOGLE_SCOPE,
    prompt: "select_account",
  })
);

// Admin user (with session flag)
router.get(
  "/admin/google",
  (req: Request, _res: Response, next: NextFunction) => {
    req.session.isAdminFlow = true;
    console.log("Admin OAuth - isAdminFlow flag set");
    next();
  },
  passport.authenticate("google", {
    scope: GOOGLE_SCOPE,
    prompt: "select_account",
  })
);

// ==========================
// Unified Google Callback
// ==========================

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
  }),
  async (req: Request, res: Response): Promise<void> => {
    const isAdmin = req.session.isAdminFlow || false;
    delete req.session.isAdminFlow;

    console.log("Google callback - isAdminFlow:", isAdmin);

    if (isAdmin) {
      const user = req.user as any;

      console.log("Checking admin access for:", {
        id: user?._id,
        role: user?.memberType,
      });

      if (!user || !ADMIN_ROLES.includes(user.memberType)) {
        console.warn("Access denied: Not an admin");
        res.send(
          `<script>alert("Access denied. Admin privileges required."); window.location.replace("/admin/login");</script>`
        );
        return;
      }

      console.log("Admin access granted");
    }

    await handleAuthSuccess(req, res, DEFAULT_REDIRECT);
  }
);

export default router;
