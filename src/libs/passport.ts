// src/libs/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MemberModel from "../schema/Member.model";

// Single Google OAuth Strategy that handles both flows
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!, // Single callback URL
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile:", profile);
        console.log("Request URL:", req.url);

        // Determine if this is admin flow based on the request path
        const isAdminFlow = req.url.includes("/admin/");
        console.log("Is admin flow:", isAdminFlow);

        // Check if user already exists by Google ID or email
        let existingUser = await MemberModel.findOne({
          $or: [
            { googleId: profile.id },
            { memberEmail: profile.emails?.[0]?.value },
          ],
        });

        if (existingUser) {
          console.log("Existing user found:", {
            id: existingUser._id,
            type: existingUser.memberType,
            email: existingUser.memberEmail,
          });

          // Update Google ID if not set
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            await existingUser.save();
            console.log("Updated Google ID for existing user");
          }

          return done(null, existingUser);
        }

        // For admin flow, don't auto-create users
        if (isAdminFlow) {
          console.log("Admin flow: User not found, denying access");
          return done(
            new Error(
              "User not found. Please contact administrator for admin access."
            ),
            undefined
          );
        }

        // Create new user for regular flow only
        const newUser = new MemberModel({
          googleId: profile.id,
          memberNick: profile.displayName,
          memberEmail: profile.emails?.[0]?.value,
          memberImage: profile.photos?.[0]?.value,
          memberStatus: "ACTIVE",
          memberType: "USER",
          memberAuth: "USER",
        });

        const savedUser = await newUser.save();
        console.log("New Google user created:", savedUser);
        return done(null, savedUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, undefined);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await MemberModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
