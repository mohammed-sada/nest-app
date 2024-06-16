import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";
import {AuthController} from "./auth/auth.controller";
import {AuthService} from "./auth/auth.service";
import {User} from "./user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class UserModule {}
