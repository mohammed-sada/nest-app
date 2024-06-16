import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { HomeController } from "./home.controller";
import { HomeService } from "./home.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Home, Image, Message } from "./home.entity";
import { TasksModule } from "src/cron/tasks.module";

@Module({
  imports: [TypeOrmModule.forFeature([Home, Image, Message])],
  controllers: [HomeController],
  providers: [
    HomeService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class HomeModule { }
