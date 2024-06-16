import {User} from "src/user/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

export enum PropertyType {
  RESIDENTIAL = "RESIDENTIAL",
  CONDO = "CONDO",
}

@Entity()
export class Home {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  number_of_bedrooms: number;

  @Column()
  number_of_bathrooms: number;

  @Column()
  city: string;

  @CreateDateColumn({type: "timestamp"})
  listed_date: Date;

  @Column("double precision") // Store as double precision in the database
  price: number;

  @Column("double precision")
  land_size: number;

  @Column({
    type: "enum",
    enum: [PropertyType.RESIDENTIAL, PropertyType.CONDO], // Use the constants in the enum
    default: PropertyType.RESIDENTIAL,
  })
  propertyType: PropertyType;

  @CreateDateColumn({type: "timestamp"})
  created_at: Date;

  @UpdateDateColumn({type: "timestamp"})
  updated_at: Date;

  @Column()
  realtor_id: number;

  @ManyToOne(() => User, (user) => user.homes) // Define the many-to-one relationship
  realtor: User; // This field will hold the User who is the realtor for this home

  @OneToMany(() => Image, (image) => image.home, {cascade: true})
  images: Image[];

  @OneToMany(() => Message, (message) => message.home)
  messages: Message[];
}

@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  home_id: number;

  @ManyToOne(() => Home, (home) => home.images)
  home: Home;
}

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  home_id: number;

  @Column()
  realtor_id: number;

  @Column()
  buyer_id: number;

  @ManyToOne(() => Home, (home) => home.messages)
  home: Home;

  @ManyToOne(() => User, (user) => user.realtor_messages)
  realtor: User;

  @ManyToOne(() => User, (user) => user.buyer_messages)
  buyer: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
