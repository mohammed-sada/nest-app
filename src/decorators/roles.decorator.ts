import {SetMetadata} from "@nestjs/common";
import {UserType} from "src/user/user.entity";

export const Roles = (...roles: UserType[]) => SetMetadata("roles", roles);
