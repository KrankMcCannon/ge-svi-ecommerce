import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { DataSource, EntityManager } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserDTO } from './dtos/user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user.
   *
   * @param createUserDto Data Transfer Object for creating a user.
   * @returns The created user.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDTO> {
    const userExists = await this.findByEmail(createUserDto.email);
    if (userExists) {
      throw CustomException.fromErrorEnum(Errors.E_0027_INVALID_USER, {
        data: { email: createUserDto.email },
      });
    }
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.usersRepo.createUser({
      ...userData,
      password: hashedPassword,
    });
  }

  /**
   * Retrieves a user by email.
   *
   * @param email User's email.
   * @returns The found user
   * @throws CustomException if the user is not found.
   */
  async findByEmail(email: string): Promise<UserDTO | null> {
    return await this.usersRepo.findByEmail(email);
  }

  /**
   * Retrieves a user by ID.
   *
   * @param id User's ID.
   * @param manager Optional transaction manager.
   * @returns The found user.
   */
  async findById(id: string, manager?: EntityManager): Promise<UserDTO | null> {
    return await this.usersRepo.findById(id, manager);
  }

  /**
   * Updates a user.
   *
   * @param id User's ID.
   * @param updateUserDto Data Transfer Object for updating a user.
   * @returns The updated user.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.usersRepo.findById(id, queryRunner.manager);
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const updatedUser = await this.usersRepo.updateUser(
        user,
        updateUserDto,
        queryRunner.manager,
      );
      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!(error instanceof CustomException)) {
        throw CustomException.fromErrorEnum(Errors.E_0023_USER_UPDATE_ERROR, {
          data: { id },
          originalError: error,
        });
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Deletes a user.
   *
   * @param id User's ID.
   */
  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.findById(id, queryRunner.manager);
      await this.usersRepo.deleteUser(id, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (!(error instanceof CustomException)) {
        throw CustomException.fromErrorEnum(Errors.E_0024_USER_REMOVE_ERROR, {
          data: { id },
          originalError: error,
        });
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
