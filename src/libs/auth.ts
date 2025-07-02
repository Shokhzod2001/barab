// src/routes/auth.ts
import express from "express";
import passport from "passport";
import { AUTH_TIMER } from "../libs/config";
import AuthService from "../models/Auth.service";

// Extend session type to include our custom properties
declare module "express-session" {
  interface SessionData {
    isAdminFlow?: boolean;
  }
}

const router = express.Router();
const authService = new AuthService();

// Helper function to handle successful authentication
const handleAuthSuccess = async (
  req: express.Request,
  res: express.Response,
  redirectPath: string
) => {
  try {
    const user = req.user as any;
    console.log("OAuth Success - Creating token for user:", {
      id: user._id,
      type: user.memberType,
      email: user.memberEmail || user.googleEmail,
    });

    const token = await authService.createToken(
      user.toObject ? user.toObject() : { ...user }
    );

    // Set the cookie with proper settings
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER * 60 * 60 * 1000,
      httpOnly: true,
      secure: false, // ✅ Force false for localhost
      sameSite: "lax", // ✅ Allow redirect to receive cookie
      path: "/", // ✅ Keep this
    });

    console.log("Token created and cookie set, redirecting to:", redirectPath);
    res.redirect(redirectPath);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.send(
      `<script>alert("Authentication failed: ${error}"); window.location.replace("/login");</script>`
    );
  }
};

// REGULAR USER OAUTH (for customer interface)
// ===========================================

// Google OAuth routes for regular users
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// ADMIN OAUTH (for admin interface)
// =================================

// Google OAuth routes for admin - set session flag before redirect
router.get(
  "/admin/google",
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Set flag to indicate this is admin flow
    req.session.isAdminFlow = true;
    console.log("Admin Google OAuth - Setting admin flow flag");
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// SINGLE CALLBACK ROUTE FOR BOTH FLOWS
// ====================================

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=google_auth_failed",
  }),
  async (req: express.Request, res: express.Response): Promise<void> => {
    const isAdmin = req.session.isAdminFlow || false;
    console.log("Google callback - Is admin flow:", isAdmin);

    if (req.session.isAdminFlow) {
      delete req.session.isAdminFlow;
    }

    const redirectPath = "/admin/product/all";

    if (isAdmin) {
      const user = req.user as any;
      console.log("Verifying admin privileges for user:", {
        type: user?.memberType,
        id: user?._id,
      });

      if (!user || !["ADMIN", "RESTAURANT", "CHEF"].includes(user.memberType)) {
        console.log("Access denied - insufficient privileges");
        res.send(
          `<script>alert("Access denied. Admin privileges required."); window.location.replace("/admin/login");</script>`
        );
        return;
      }
      console.log("Admin privileges verified");
    }

    return await handleAuthSuccess(req, res, redirectPath); // ✅ await and return
  }
);

export default router;
