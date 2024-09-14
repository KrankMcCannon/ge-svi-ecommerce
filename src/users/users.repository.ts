import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from 'src/base.repository';
import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos';
import { EntityManager, Repository } from 'typeorm';
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
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepo.findOne({ where: { email } });
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { email },
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
  async findById(id: string, manager?: EntityManager): Promise<User> {
    return await this.findEntityById(id, manager);
  }

  /**
   * Creates a new user.
   *
   * @param user User entity to create.
   * @returns The created user.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepo.create(createUserDto);
      return await this.saveEntity(user);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR, {
        data: { user: createUserDto },
        originalError: error,
      });
    }
  }

  /**
   * Updates a user.
   *
   * @param user User entity to update.
   * @returns The updated user.
   */
  async updateUser(
    user: User,
    updateUserDto: UpdateUserDto,
    manager?: EntityManager,
  ): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.userRepo;
    try {
      await repo.update(user.id, updateUserDto);
      return await this.findEntityById(user.id, manager);
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
  async saveUser(user: User, manager?: EntityManager): Promise<User> {
    const repo = manager ? manager.getRepository(User) : this.repo;
    try {
      return await repo.save(user);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0022_USER_CREATION_ERROR, {
        data: { user },
        originalError: error,
      });
    }
  }
}
