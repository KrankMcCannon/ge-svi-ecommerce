import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user by email and password.
   *
   * @param email User's email.
   * @param password User's password.
   * @throws CustomException if the user is not found or the password is invalid.
   */
  async validateUser(email: string, password: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { email },
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw CustomException.fromErrorEnum(Errors.E_0027_INVALID_USER);
    }
  }

  /**
   * Logs in a user and returns a JWT token.
   *
   * @param user User data.
   * @returns Object containing the access token.
   */
  async login(user: User): Promise<{ accessToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user.
   *
   * @param createUserDto Data Transfer Object for creating a user.
   * @returns Created user data without password.
   * @throws CustomException if the user already exists.
   */
  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw CustomException.fromErrorEnum(Errors.E_0026_DUPLICATE_USER, {
        data: { email: createUserDto.email },
      });
    }
    const user = await this.usersService.create(createUserDto);
    delete user.password;
    return user;
  }
}
