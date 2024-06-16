import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UserInterceptor } from './user/interceptors/user.interceptor';
import { AuthGuard } from './guards/auth.guard';
import { DatabaseModule } from './database/database.module';
import { HomeModule } from './home/home.module';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpCacheInterceptor } from './user/interceptors/http-cache.interceptor';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule, CacheModule.register({
    isGlobal: true,
  }), UserModule, HomeModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      // global
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
    {
      // global
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
    {
      // global
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
