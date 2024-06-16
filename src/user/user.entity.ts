import {Home, Message} from "src/home/home.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

export enum UserType {
  BUYER = "BUYER",
  REALTOR = "REALTOR",
  ADMIN = "ADMIN",
  ALL = "ALL",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({unique: true})
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({type: "timestamp"})
  updated_at: Date;

  @Column({type: "enum", enum: UserType, default: UserType.BUYER})
  user_type: UserType;

  @OneToMany(() => Home, (home) => home.realtor) // Define the one-to-many relationship
  homes: Home[]; // This field will hold an array of homes owned by this user (realtor)

  @OneToMany(() => Message, (message) => message.buyer)
  buyer_messages: Message[];

  @OneToMany(() => Message, (message) => message.realtor)
  realtor_messages: Message[];
}
