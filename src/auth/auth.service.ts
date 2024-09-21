import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { EmailProducerService } from 'src/email/email-producer.service';
import { CreateUserDto } from 'src/users/dtos';
import { UserDTO } from 'src/users/dtos/user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailProducerService: EmailProducerService,
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
    try {
      const user = await this.usersService.findByEmail(inputEmail);
      CustomLogger.info(
        `User found with email: ${user ? user.email : inputEmail}`,
      );

      const isPasswordValid = await bcrypt.compare(
        inputPassword.trim(),
        user.password,
      );
      if (!isPasswordValid) {
        throw CustomException.fromErrorEnum(Errors.E_0045_INVALID_USER, {
          data: { email: inputEmail, password: inputPassword },
        });
      }

      CustomLogger.info(`User validated with email: ${user.email}`);
      return UserDTO.fromPasswordDTO(user);
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0045_INVALID_USER, {
        data: { email: inputEmail, password: inputPassword },
        originalError: error,
      });
    }
  }

  /**
   * Logs in a user and returns a JWT token.
   *
   * @param user User data.
   * @returns Object containing the access token.
   */
  async login(user: UserDTO): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };

    await this.emailProducerService.sendEmailTask({
      email: user.email,
      subject: 'Login Notification',
      message: `Hello ${user.email}, you have successfully logged in.`,
    });

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
    try {
      await this.usersService.findByEmail(createUserDto.email);
      CustomLogger.info(`User correctly not exists`);
      const user = await this.usersService.create(createUserDto);
      CustomLogger.info(`User created with email: ${user.email}`);

      await this.emailProducerService.sendEmailTask({
        email: user.email,
        subject: 'Welcome to Our Platform',
        message: `Hello ${user.email}, your registration was successful.`,
      });

      return user;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0044_DUPLICATE_USER, {
        data: { email: createUserDto.email },
        originalError: error,
      });
    }
  }
}
