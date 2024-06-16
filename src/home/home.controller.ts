import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Body,
  UnauthorizedException,
  VERSION_NEUTRAL,
  Version,
} from "@nestjs/common";
import { User, UserInfo } from "src/user/decorators/user.decorator";
import {
  CreateHomeDto,
  HomeResponseDto,
  InquireDto,
  UpdateHomeDto,
} from "./dto/home.dto";
import { HomeService } from "./home.service";
import { Roles } from "src/decorators/roles.decorator";
import { UserType } from "src/user/user.entity";
import { PropertyType } from "./home.entity";
import { TasksService } from "src/cron/tasks-service.service";
import { SchedulerRegistry } from "@nestjs/schedule";

@Controller({
  path: "home",
  version: VERSION_NEUTRAL,
})
export class HomeController {
  constructor(
    private readonly homeService: HomeService,
    // private readonly tasksService: TasksService,
    private schedulerRegistry: SchedulerRegistry
  ) { }

  // @Version(VERSION_NEUTRAL)
  @Get()
  getHomes(
    @Query("city") city?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("propertyType") propertyType?: PropertyType
  ): Promise<HomeResponseDto[]> {
    // this.tasksService.handleCron();
    // this.tasksService.handleInterval();
    // this.tasksService.triggerNotifications();
    const job = this.schedulerRegistry.getCronJob('notifications');
    job.stop();
    console.log(job.lastDate());

    const price =
      minPrice || maxPrice
        ? {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        }
        : undefined;

    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };

    return this.homeService.getHomes(filters);
  }

  @Get(":id")
  getHome(@Param("id", ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }

  @Roles(UserType.REALTOR)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: UserInfo) {
    return this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(":id")
  async updateHome(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateHomeDto,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.updateHomeById(id, body);
  }

  @Roles(UserType.REALTOR)
  @Delete(":id")
  async deleteHome(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.deleteHomeById(id);
  }

  @Roles(UserType.BUYER)
  @Post("/:id/inquire")
  inquire(
    @Param("id", ParseIntPipe) homeId: number,
    @User() user: UserInfo,
    @Body() { message }: InquireDto
  ) {
    return this.homeService.inquire(user, homeId, message);
  }

  @Roles(UserType.REALTOR)
  @Get("/:id/messages")
  async getHomeMessages(
    @Param("id", ParseIntPipe) id: number,
    @User() user: UserInfo
  ) {
    const realtor = await this.homeService.getRealtorByHomeId(id);

    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.homeService.getMessagesByHome(id);
  }
}

// 1) Buyer sends message to Realtor
// 2) Realtor gets all messages
