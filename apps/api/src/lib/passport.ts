import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import * as userRepo from "../repositories/userRepository";

export function setupPassport() {
  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((obj: any, done) => done(null, obj));

  const hasGoogle = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasGithub = process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;
  const hasFacebook = process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET;

  if (hasGoogle) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (_access, _refresh, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.id}@google.local`;
            const user = await userRepo.createOrUpdateOAuth({
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              provider: "google",
              providerId: profile.id,
            });
            done(null, user);
          } catch (e) {
            done(e as any);
          }
        }
      )
    );
  }

  if (hasGithub) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:4000/api/auth/github/callback",
          scope: ["user:email"],
        },
        async (_access: any, _refresh: any, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
            const user = await userRepo.createOrUpdateOAuth({
              email,
              name: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
              provider: "github",
              providerId: profile.id,
            });
            done(null, user);
          } catch (e) {
            done(e as any);
          }
        }
      )
    );
  }

  if (hasFacebook) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID!,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:4000/api/auth/facebook/callback",
          profileFields: ["id", "displayName", "photos", "email"],
        },
        async (_access: any, _refresh: any, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`;
            const user = await userRepo.createOrUpdateOAuth({
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              provider: "facebook",
              providerId: profile.id,
            });
            done(null, user);
          } catch (e) {
            done(e as any);
          }
        }
      )
    );
  }

  return { hasGoogle, hasGithub, hasFacebook };
}
