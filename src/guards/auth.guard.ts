import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import * as jwt from "jsonwebtoken";
import { DataSource } from "typeorm";
import { User, UserType } from "src/user/user.entity";

interface JWTPayload {
  name: string;
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DataSource) private readonly dataSource: DataSource
  ) { }

  async canActivate(context: ExecutionContext) {
    const roles: string[] = this.reflector.getAllAndOverride("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers?.authorization?.split("Bearer ")[1];

      try {
        const payload = (await jwt.verify(
          token,
          process.env.JSON_TOKEN_KEY
        )) as JWTPayload;

        const user = await this.dataSource.getRepository(User).findOneBy({
          id: payload.id,
        });

        if (!user) return false;
        if (roles.includes(UserType.ALL) || roles.includes(user.user_type))
          return true;

        return false;
      } catch (error) {
        return false;
      }
    }

    return true;
  }
}
