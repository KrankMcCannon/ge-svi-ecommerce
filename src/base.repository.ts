import { CustomException } from 'src/config/custom-exception';
import { Errors } from 'src/config/errors';
import { PaginationInfo } from 'src/config/pagination-info.dto';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

export class BaseRepository<Entity> {
  protected readonly repo: Repository<Entity>;

  constructor(repo: Repository<Entity>) {
    this.repo = repo;
  }

  /**
   * Saves an entity to the database.
   *
   * @param entity Entity to save.
   * @param manager Optional entity manager.
   * @returns The saved entity.
   */
  protected async saveEntity(
    entity: Entity,
    manager?: EntityManager,
  ): Promise<Entity> {
    const repo = manager
      ? manager.getRepository<Entity>(this.repo.metadata.target)
      : this.repo;

    try {
      return await repo.save(entity);
    } catch (error) {
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
        data: { entity },
        originalError: error,
      });
    }
  }

  /**
   * Find an entity by its ID.
   *
   * @param entity Entity to delete.
   * @param manager Optional entity manager.
   * @returns The found entity.
   */
  protected async findEntityById(
    id: any,
    manager?: EntityManager,
  ): Promise<Entity> {
    const repo = manager
      ? manager.getRepository<Entity>(this.repo.metadata.target)
      : this.repo;
    try {
      const { primaryColumns } = repo.metadata;
      if (primaryColumns.length !== 1) {
        throw CustomException.fromErrorEnum(Errors.E_0005_INTEGRITY_ERROR, {
          data: { id },
          originalError: new Error('Composite primary keys are not supported.'),
        });
      }
      const primaryKey = primaryColumns[0].propertyName as keyof Entity;
      const entity = await repo.findOne({ where: { [primaryKey]: id } as any });
      if (!entity) {
        throw CustomException.fromErrorEnum(Errors.E_0002_NOT_FOUND_ERROR, {
          data: { id },
        });
      }
      return entity;
    } catch (error) {
      if (error instanceof CustomException) {
        throw error;
      }
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
        data: { id },
        originalError: error,
      });
    }
  }

  /**
   * Applies pagination to a query builder.
   *
   * @param qb Query builder to apply pagination to.
   * @param pagination Pagination information.
   */
  protected applyPagination(
    qb: SelectQueryBuilder<Entity>,
    pagination: PaginationInfo,
  ) {
    const { pageNumber = 0, pageSize = 20 } = pagination;
    qb.skip(pageNumber * pageSize).take(pageSize);
  }

  /**
   * Applies sorting to a query builder.
   *
   * @param qb Query builder to apply sorting to.
   * @param sort Sort field.
   * @param alias Alias for the entity
   */
  protected applySorting(
    qb: SelectQueryBuilder<Entity>,
    sort?: string,
    alias: string = '',
  ) {
    if (sort) {
      const order = sort.startsWith('-') ? 'DESC' : 'ASC';
      const field = sort.startsWith('-') ? sort.substring(1) : sort;

      const columnExists = this.repo.metadata.primaryColumns.some(
        (col) => col.propertyName === field,
      );
      if (columnExists) {
        qb.orderBy(`${alias}${field}`, order);
      } else {
        throw new Error(`Sorting field "${field}" does not exist.`);
      }
    }
  }

  /**
   * Applies filters to a query builder.
   *
   * @param qb Query builder to apply filters to.
   * @param query Query object.
   */
  protected applyFilters(qb: SelectQueryBuilder<Entity>, query: any) {
    Object.keys(query).forEach((key) => {
      if (
        this.repo.metadata.primaryColumns.some(
          (col) => col.propertyName === key,
        )
      ) {
        qb.andWhere(`${this.repo.metadata.target}.${key} = :${key}`, {
          [key]: query[key],
        });
      }
    });
  }
}
