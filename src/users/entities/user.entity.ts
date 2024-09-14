import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Full name of the user', maxLength: 255 })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Email address of the user', maxLength: 255 })
  @Column({ length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'Password of the user (hashed)' })
  @Column()
  @Exclude()
  password: string;

  @ApiProperty({ description: 'Role of the user', default: 'user' })
  @Column({ default: 'user' })
  role: string;

  @ApiProperty({ description: 'Cart belonging to the user' })
  @OneToOne(() => Cart, (cart) => cart.user, {
    cascade: true,
    eager: true,
  })
  cart: Cart;

  @ApiProperty({
    description: 'The date the user was created',
    type: 'string',
    format: 'date-time',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The date the user was last updated',
    type: 'string',
    format: 'date-time',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'Salt used to hash the user password' })
  @Column({ nullable: true })
  @Exclude()
  salt: string;

  protected async setPassword(password: string) {
    this.salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(password, this.salt);
  }

  protected async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
