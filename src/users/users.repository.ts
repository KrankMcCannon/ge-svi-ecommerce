import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import {
  CreateUserDto,
  UpdateUserDto,
  UserWithPasswordDTO,
} from 'src/users/dtos';
import { EntityManager, Repository } from 'typeorm';
import { UserDTO } from './dtos/user.dto';
import { User } from './entities';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  /**
   * Finds a user by email.
   *
   * @param email User's email.
   * @returns The found user or null.
   */
  async findByEmail(email: string): Promise<UserWithPasswordDTO | null> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      return user ? UserWithPasswordDTO.fromEntity(user) : null;
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { email },
        originalError: error,
      });
    }
  }

  /**
   * Creates a new user.
   *
   * @param user User entity to create.
   * @returns The created user.
   */
  async createUser(createUserDto: CreateUserDto): Promise<UserDTO> {
    try {
      const createdUser = this.userRepo.create(createUserDto);
      const user = await this.saveEntity(createdUser);
      return UserDTO.fromEntity(user);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR, {
        data: { user: createUserDto },
        originalError: error,
      });
    }
  }

  /**
   * Finds a user by ID.
   *
   * @param id User's ID.
   * @returns The found user.
   */
  async findById(id: string, manager?: EntityManager): Promise<UserDTO> {
    const user = await this.findEntityById(id, manager);
    return UserDTO.fromEntity(user);
  }

  /**
   * Updates a user.
   *
   * @param user User entity to update.
   * @returns The updated user.
   */
  async updateUser(
    inputUser: UserDTO,
    updateUserDto: UpdateUserDto,
    manager?: EntityManager,
  ): Promise<UserDTO> {
    const repo = manager ? manager.getRepository(User) : this.userRepo;
    const user = UserDTO.toEntity(inputUser);
    try {
      await repo.update(user.id, updateUserDto);
      const updatedUser = await this.findEntityById(user.id, manager);
      return UserDTO.fromEntity(updatedUser);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0023_USER_UPDATE_ERROR, {
        data: { user: updateUserDto },
        originalError: error,
      });
    }
  }

  /**
   * Deletes a user.
   *
   * @param id User ID.
   * @param manager Optional transaction manager.
   */
  async deleteUser(id: string, manager?: EntityManager): Promise<void> {
    const repo = manager ? manager.getRepository(User) : this.userRepo;
    try {
      const result = await repo.delete(id);
      if (result.affected === 0) {
        throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
          data: { id },
        });
      }
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0024_USER_REMOVE_ERROR, {
        data: { id },
        originalError: error,
      });
    }
  }

  /**
   * Saves a user.
   *
   * @param user User entity to save.
   * @returns The saved user.
   */
  async saveUser(
    inputUser: UserDTO,
    manager?: EntityManager,
  ): Promise<UserDTO> {
    const repo = manager ? manager.getRepository(User) : this.repo;
    const user = UserDTO.toEntity(inputUser);
    try {
      const savedUser = await repo.save(user);
      return UserDTO.fromEntity(savedUser);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR, {
        data: { user },
        originalError: error,
      });
    }
  }
}
