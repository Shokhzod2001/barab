import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MemberModel from "../schema/Member.model";

// ==== Constants ====
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

// ==== Main Google Strategy ====
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: GOOGLE_CALLBACK_URL!,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const isAdminFlow = req.url.includes("/admin/");
        const email = profile.emails?.[0]?.value;

        const existingUser = await MemberModel.findOne({
          $or: [{ googleId: profile.id }, { memberEmail: email }],
        });

        if (existingUser) {
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            await existingUser.save();
            console.log("Updated Google ID for user:", existingUser._id);
          }

          console.log("User logged in:", existingUser._id);
          return done(null, existingUser);
        }

        if (isAdminFlow) {
          console.warn("Admin login - user not found. Denying access.");
          return done(
            new Error("Access denied. Admin user not registered."),
            undefined
          );
        }

        const newUser = new MemberModel({
          googleId: profile.id,
          memberNick: profile.displayName,
          memberEmail: email,
          memberImage: profile.photos?.[0]?.value,
          memberStatus: "ACTIVE",
          memberType: "USER",
          memberAuth: "USER",
        });

        const savedUser = await newUser.save();
        console.log("New user registered:", savedUser._id);

        return done(null, savedUser);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err, undefined);
      }
    }
  )
);

// ==== Session Handling ====
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await MemberModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
