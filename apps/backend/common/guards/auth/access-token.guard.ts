import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError } from "jsonwebtoken";

@Injectable()
export class AccessTokenGuard extends AuthGuard("jwt") {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token has expired");
      } else if (info instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token");
      } else {
        if (err && err.constructor) {
          throw new err.constructor(err.message);
        } else {
          throw new UnauthorizedException("Unauthorized");
        }
      }
    }
    return user;
  }
}
