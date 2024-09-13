import { Test, TestingModule } from '@nestjs/testing';
import { ProductsRepository } from './products.repository';
import { Product } from '../entities/product.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let ormRepository: jest.Mocked<Repository<Product>>;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    cartItems: [],
  };

  const mockOrmRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsRepository,
        {
          provide: getRepositoryToken(Product),
          useValue: mockOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
    ormRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    ) as jest.Mocked<Repository<Product>>;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByName', () => {
    it('should return a product if found', async () => {
      ormRepository.findOne.mockResolvedValue(mockProduct);

      const result = await repository.findByName('Test Product');
      expect(result).toEqual(mockProduct);
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Test Product' },
      });
    });

    it('should return null if not found', async () => {
      ormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findByName('Nonexistent Product');
      expect(result).toBeNull();
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { name: 'Nonexistent Product' },
      });
    });
  });
});
