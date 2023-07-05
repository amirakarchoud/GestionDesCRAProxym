import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../../user-module/Entities/role.enum";
import { Observable } from "rxjs";
import { User } from "../../user-module/Entities/user.entity";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Role[]>('roles', context.getHandler());
    if (!roles?.length) {
      return true;
    }
    console.log(roles);
    
    const { user } = context.switchToHttp().getRequest();
    console.log((user as User).role);
    const hasAppropriateRole = roles.includes((user as User).role);
    if (!hasAppropriateRole) {
      throw new UnauthorizedException(`
        it appears that you don't have permission to access this content. 
        `);
    }
    return true;
  }
}
