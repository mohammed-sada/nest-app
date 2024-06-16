import { Injectable, NotFoundException } from "@nestjs/common";
import { UserInfo } from "src/user/decorators/user.decorator";
import { HomeResponseDto } from "./dto/home.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Home, Image, Message, PropertyType } from "./home.entity";
import {
  FindOptionsSelect,
  In,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { User } from "src/user/user.entity";

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

interface CreateHomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  landSize: number;
  propertyType: PropertyType;
  images: { url: string; }[];
}

interface UpdateHomeParams {
  address?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  city?: string;
  price?: number;
  landSize?: number;
  propertyType?: PropertyType;
}

export const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Home) private readonly homeRepository: Repository<Home>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) { }
  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const where: any = {};

    if (filter.city) {
      where.city = Like(`%${filter.city}%`);
    }

    if (filter.price?.gte !== undefined) {
      where.price = MoreThanOrEqual(filter.price.gte);
    }

    if (filter.price?.lte !== undefined) {
      where.price = LessThanOrEqual(filter.price.lte);
    }

    if (filter.propertyType) {
      where.propertyType = In([filter.propertyType]);
    }

    try {
      const homes = await this.homeRepository.find({
        select: Object.keys(homeSelect) as FindOptionsSelect<Home>,
        where,
        relations: ["images"],
      });

      if (!homes.length) {
        throw new NotFoundException();
      }

      return homes.map((home) => {
        const image =
          home.images && home.images.length > 0 ? home.images[0].url : null;
        const fetchedHome = { ...home, image: image };
        delete fetchedHome.images;
        return new HomeResponseDto(home);
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getHomeById(id: number): Promise<HomeResponseDto> {
    try {
      const home = await this.homeRepository.findOne({
        where: { id },
        select: Object.keys(homeSelect) as FindOptionsSelect<Home>,
        relations: ["realtor", "images"],
      });

      if (!home) {
        throw new NotFoundException();
      }

      return new HomeResponseDto(home);
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async createHome(
    {
      address,
      numberOfBathrooms,
      numberOfBedrooms,
      city,
      landSize,
      price,
      propertyType,
      images,
    }: CreateHomeParams,
    userId: number
  ): Promise<HomeResponseDto> {
    const home = await this.homeRepository.save({
      address,
      number_of_bathrooms: numberOfBathrooms,
      number_of_bedrooms: numberOfBedrooms,
      city,
      land_size: landSize,
      propertyType,
      price,
      realtor_id: userId,
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });

    await this.imageRepository.save(homeImages);

    return new HomeResponseDto(home);
  }

  async updateHomeById(
    id: number,
    data: UpdateHomeParams
  ): Promise<HomeResponseDto> {
    const home = await this.homeRepository.findOneBy({ id });

    if (!home) {
      throw new NotFoundException();
    }

    // Update the properties of the retrieved home entity with the new data
    Object.assign(home, data);

    const updatedHome = await this.homeRepository.save(home);

    return new HomeResponseDto(updatedHome);
  }

  async deleteHomeById(id: number): Promise<void> {
    // this will also delete the associated images because we specified cascade to true in home entity
    const deleteResult = await this.homeRepository.delete(id);

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }

  async getRealtorByHomeId(id: number): Promise<User> {
    const home = await this.homeRepository.findOne({
      where: { id },
      relations: ["realtor"],
    });

    if (!home) {
      throw new NotFoundException();
    }

    return home.realtor;
  }

  async inquire(
    buyer: UserInfo,
    homeId: number,
    message: string
  ): Promise<Message> {
    const realtor = await this.getRealtorByHomeId(homeId);

    return await this.messageRepository.save({
      realtor,
      buyer,
      home: { id: homeId },
      message,
    });
  }

  async getMessagesByHome(homeId: number) {
    return await this.messageRepository.find({
      where: {
        home_id: homeId,
      },
      select: {
        message: true,
      },
      relations: ["buyer"],
    });
  }
}
