import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { CreateUserDto } from 'src/users/dtos';
import { UserDTO } from 'src/users/dtos/user.dto';
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
   * @returns The validated user without password.
   * @throws CustomException if the user is not found or the password is invalid.
   */
  async validateUser(
    inputEmail: string,
    inputPassword: string,
  ): Promise<UserDTO> {
    const user = await this.usersService.findByEmail(inputEmail);
    if (!user) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { email: inputEmail },
      });
    }

    const isPasswordValid = await bcrypt.compare(
      inputPassword.trim(),
      user.password,
    );
    if (!isPasswordValid) {
      throw CustomException.fromErrorEnum(Errors.E_0027_INVALID_USER, {
        data: { email: inputEmail, password: inputPassword },
      });
    }

    return UserDTO.fromPasswordDTO(user);
  }

  /**
   * Logs in a user and returns a JWT token.
   *
   * @param user User data.
   * @returns Object containing the access token.
   */
  async login(user: {
    email: string;
    password: string;
  }): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user.
   *
   * @param createUserDto Data Transfer Object for creating a user.
   * @returns Created user data without password.
   * @throws CustomException if the user already exists.
   */
  async register(createUserDto: CreateUserDto): Promise<UserDTO> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw CustomException.fromErrorEnum(Errors.E_0026_DUPLICATE_USER, {
        data: { email: createUserDto.email },
      });
    }

    return await this.usersService.create(createUserDto);
  }
}
