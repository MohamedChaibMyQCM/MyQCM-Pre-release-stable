import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { AuthUserService } from "../services/auth-user.service";
import { getEnvOrFatal } from "common/utils/env.util";
import { createGoogleCallbackUrl } from "common/utils/url.util";
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authUserService: AuthUserService) {
    super({
      clientID: getEnvOrFatal<string>("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvOrFatal<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: createGoogleCallbackUrl(
        getEnvOrFatal<string>("BACKEND_URL"),
      ),
      scope: ["email", "profile"],
    });
  }
  authenticate(req: any, options: any) {
    options.state = req.query.locale;
    super.authenticate(req, options);
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
    };

    const authenticatedUser =
      await this.authUserService.validateUserWithGoogle(user);
    done(null, authenticatedUser);
  }
}
