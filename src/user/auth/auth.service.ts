import {Injectable, ConflictException, HttpException} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {User, UserType} from "../user.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";

interface SignupParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SigninParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async signup(
    {email, password, name, phone}: SignupParams,
    userType: UserType
  ) {
    const userExists = await this.userRepository.findOneBy({email});

    if (userExists) {
      throw new ConflictException("Email address is already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.save({
      email,
      name,
      phone,
      password: hashedPassword,
      user_type: userType,
    });

    return this.generateJWT(name, user.id);
  }

  async signin({email, password}: SigninParams) {
    const user = await this.userRepository.findOneBy({email});

    if (!user) {
      throw new HttpException("Invalid credentials", 400);
    }

    const hashedPassword = user.password;

    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException("Invalid credentials", 400);
    }

    return this.generateJWT(user.name, user.id);
  }

  private generateJWT(name: string, id: number) {
    return jwt.sign(
      {
        name,
        id,
      },
      process.env.JSON_TOKEN_KEY,
      {
        expiresIn: 3600000,
      }
    );
  }

  async generateProductKey(email: string, userType: UserType) {
    const userExists = await this.userRepository.findOneBy({email});

    if (userExists) {
      throw new ConflictException();
    }

    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

    return bcrypt.hash(string, 10);
  }
}
