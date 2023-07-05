import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { Role } from "../../user-module/Entities/role.enum";
import { RolesGuard } from "../guards/roles.guard";
import { AuthGuard } from "../auth.guard";

export function Roles(...roles: Role[]) {
    return applyDecorators(UseGuards(AuthGuard), SetMetadata('roles', roles), UseGuards(RolesGuard));
  }
  