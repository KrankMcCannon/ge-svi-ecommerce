import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos';
import { Product } from './entities';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [],
    comments: [],
  };

  const mockProductsService = {
    createProduct: jest.fn().mockResolvedValue(mockProduct),
    findAllProducts: jest.fn().mockResolvedValue([mockProduct]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    })
      .overrideProvider(ProductsService)
      .useValue(mockProductsService)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      const result = await controller.create(dto);
      expect(result.data).toEqual(mockProduct);
      expect(service.createProduct).toHaveBeenCalledWith(dto);
    });
  });
});
