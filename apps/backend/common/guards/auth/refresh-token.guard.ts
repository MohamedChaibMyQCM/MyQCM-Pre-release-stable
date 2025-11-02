import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { TokenExpiredError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { JsonWebTokenError } from "jsonwebtoken";

@Injectable()
export class RefreshTokenGuard extends AuthGuard("jwt-refresh") {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const error = err ?? info;
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedException("Token has expired");
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedException("Invalid token");
    }
    if (err) {
      throw err;
    }
    if (!user) {
      throw new UnauthorizedException("Unauthorized");
    }
    return user;
  }
}
