import ProductService from "./product-service"
import Product from '../domain/product-entity';
import ProductFilters from'../domain/product-filters';
import ProductFiltersDTO from '../application/product-filters-dto.js';
import PaginationsParams  from '../../shared/domain/paginations-params-vo';
import type ProductRepository from '../domain/product-repository.js';
import {CreateProductRequestDTO, UpdateFullProductRequestDTO, UpdatePartialProductRequestDTO, DeleteProductRequestDTO} from './product-request-dto';
import {requestDTOtoEntity, requestDeleteDTOtoEntity} from './product-request-mapper';
import { before } from "node:test";
import { rejects } from "assert";
import { resolve } from "path";

//Esta funcion lo que hace es crear un mock de ProductRepository
//jest.Mocked<ProductRepository> hace que todos los metodos de ProductRepository sean funciones mockeadas
//jest.fn() crea una funcion mock, osea una funcion que simula el comportamiento de una funcion real
//Luego si quiero simular respuestas de una funxion X puedo usar .mockResolvedValue(<valor>) por ejemplo o .mockReturnValue(<valor>), etc

//Entonces como resumen esta funcion devuelve un mock de ProductRepository ( : jest.Mocked<ProductRepository> )
// Y adentro mockeamos TODAS las funciones porque ProductRepository es una interfaz que requiere implementacion de sus metodos
function makeProductRepoMock (): jest.Mocked<ProductRepository>  {
    return {
        createProduct: jest.fn(),
        getAllProducts: jest.fn(),
        getProductBySku: jest.fn(),
        updateFullProduct: jest.fn(),
        updateProduct: jest.fn(),
        deleteProduct: jest.fn(),
        count: jest.fn(),
    };
}

//Estas variables se usaran en todos los tests asi que lo definieremos aca
let repo : jest.Mocked<ProductRepository>;
let service : ProductService;


//BeforeEach permite ejecutar una funcion antes de cada prueba dentro de describe
beforeEach(() => {
    //Usamos clearAllMocks para limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
    
    //Mockeamos las funciones
    repo = makeProductRepoMock();
    service = new ProductService(repo);
});

//describe permite agrupar pruebas relacionadas
describe("createProduct service", () => {

    //BeforeEach permite ejecutar una funcion antes de cada prueba dentro de este describe
    beforeEach(() => {
        //Algo que se quiera hacer
    });

    test('create product with repo error', async () => {
    
        //Ahora mockeamos un error con throw
        repo.createProduct.mockRejectedValueOnce(new Error('Error al crear el producto'));
        //Alternative
        //repo.createProduct.mockImplementation(() => { throw new Error('Error al crear el producto') });

        // Llamamos al servicio para crear el producto
        await expect(service.createProduct([]))
        .rejects.toThrow('Error al crear el producto');
    });

    test ('create basic product', async () => {

        const dto: CreateProductRequestDTO[] = [{
            sku: '12345',
            parent_sku: '54321',
            title: "test titulo",
            category_code: "R1000",
            description: "TEst Producto",
            short_description: "TEst short",
            is_published: true,
        }];

        //Usamos la funcion mockResolvedValueOnce que permite simular la respuesta de la funcion createProduct
        repo.createProduct.mockResolvedValueOnce([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        // Llamamos al servicio para crear el producto
        const result = await service.createProduct(dto);

        // Verificamos que la funcion createProduct del repositorio fue llamada una vez
        expect(repo.createProduct).toHaveBeenCalledTimes(1); 

        //Aqui se espera que la funcion del repo se llamada con los parametros correctos, que en este caso es un map del dto
        expect(repo.createProduct).toHaveBeenCalledWith(dto.map(requestDTOtoEntity));

        // Verificamos que el resultado es el esperado
        //Aqui tambien puede usarse expect().resolves pero debe ser usado con await
        //Ahora no es necesario porque estamos usando await en la llamada al servicio
        expect(result).toEqual([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);
    });

   
});

describe("getAllProduct service", () => {

    beforeEach(() => {
    });

    test('getAll product with repo error', async () => {
        const filtersDTO: ProductFiltersDTO = {
        };

        const paginationsParams: PaginationsParams = {
            offset: 1,
            limit: 10
        };
    
        //Ahora mockeamos un error con throw
        repo.getAllProducts.mockRejectedValueOnce(new Error('Error al obtener los productos'));

        // Llamamos al servicio para crear el producto
        await expect(service.getAllProducts(filtersDTO, paginationsParams))
        .rejects.toThrow('Error al obtener los productos');
    });

    test ('get all products', async () => {

        const filtersDTO: ProductFiltersDTO = {
            sku: '12345',
            category_code: 'R1000'
        };

        const paginationsParams: PaginationsParams = {
            offset: 1,
            limit: 10
        };

        repo.getAllProducts.mockResolvedValueOnce([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        // Llamamos al servicio para crear el producto
        const result: Product[] = await service.getAllProducts(filtersDTO, paginationsParams);

        // Verificamos que la funcion createProduct del repositorio fue llamada una vez
        expect(repo.getAllProducts).toHaveBeenCalledTimes(1);

        //Aqui se espera que la funcion del repo se llamada con los parametros correctos, que en este caso es un map del dto
        expect(repo.getAllProducts).toHaveBeenCalledWith(filtersDTO, paginationsParams);
     

        // Verificamos que el resultado es el esperado
        //Aqui tambien puede usarse expect().resolves pero debe ser usado con await
        //Ahora no es necesario porque estamos usando await en la llamada al servicio
      expect(result).toEqual([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        expect(result[0].sku).toBe(filtersDTO.sku);
        expect(result[0].categoryCode).toBe(filtersDTO.category_code);
    });

   
});

describe("count service", () => {

    beforeEach(() => {
    });

    test('count with repo error', async () => {
        const filtersDTO: ProductFiltersDTO = {
        };
    
        //Ahora mockeamos un error con throw
        repo.count.mockRejectedValueOnce(new Error('Error al contar los productos'));

        // Llamamos al servicio para crear el producto
        await expect(service.count(filtersDTO))
        .rejects.toThrow('Error al contar los productos');
    });

    test ('count products', async () => {

        const filtersDTO: ProductFiltersDTO = {
            sku: '12345',
            category_code: 'R1000'
        };

        repo.count.mockResolvedValueOnce(1);

        const countResult: number = await service.count(filtersDTO);

        expect(repo.count).toHaveBeenCalledTimes(1);
        expect(repo.count).toHaveBeenCalledWith(filtersDTO);
        expect(countResult).toBe(1);

    });

});

describe ("getProductBySku Service ", () => {
    
    test('getProductBySku with repo error', async () => {
        const sku = '12345';

        //Ahora mockeamos un error con throw
        repo.getProductBySku.mockRejectedValueOnce(new Error('Error al obtener el producto'));

        // Llamamos al servicio para crear el producto
        await expect(service.getProductBySku(sku))
        .rejects.toThrow('Error al obtener el producto');
    });

    test ('getProductBySku', async () => {

        const sku = '12345';

        repo.getProductBySku.mockResolvedValueOnce([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        const result: Product[] = await service.getProductBySku(sku);

        expect(repo.getProductBySku).toHaveBeenCalledTimes(1);
        expect(repo.getProductBySku).toHaveBeenCalledWith(sku);

        // Verificamos que el resultado es el esperado
        expect(result).toEqual([{
            sku: '12345',
            parentSku: '54321',
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);
    });

});

describe ("updateFullProduct service", () => {

    test('updateFullProduct with repo error', async () => {
        const sku = '12345';
        
        const updateData: CreateProductRequestDTO[] = [];

        //Ahora mockeamos un error con throw
        repo.updateFullProduct.mockRejectedValueOnce(new Error('Error al actualizar el producto'));

        // Llamamos al servicio para crear el producto
        await expect(service.updateFullProduct(updateData))
        .rejects.toThrow('Error al actualizar el producto');
    });

    test ('updateFullProduct', async () => {

        const sku = '12345';
        const updateData: UpdateFullProductRequestDTO[] = [{
            sku: '12345',
            parent_sku: '54321',
            title: "test titulo",
            category_code: "R1000",
            description: "TEst Producto",
            short_description: "TEst short",
            is_published: true,
        }];

        repo.updateFullProduct.mockResolvedValueOnce([{
            sku: '12345',
            parentSku: '54321',
            title: "Nuevo Titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        const result: Product[] = await service.updateFullProduct(updateData);

        expect(repo.updateFullProduct).toHaveBeenCalledTimes(1);
        expect(repo.updateFullProduct).toHaveBeenCalledWith(updateData.map(requestDTOtoEntity));

        // Verificamos que el resultado es el esperado
        expect(result).toEqual([{
            sku: '12345',
            parentSku: '54321',
            title: "Nuevo Titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);
    });

});

describe("updateProduct service", () => {

    test('updateProduct with repo error', async () => {
        const updateData: UpdateFullProductRequestDTO[] = [];

        //Ahora mockeamos un error con throw
        repo.updateProduct.mockRejectedValueOnce(new Error('Error al actualizar parcialmente el producto'));

        // Llamamos al servicio para crear el producto
        await expect(service.updateProduct(updateData))
        .rejects.toThrow('Error al actualizar parcialmente el producto');
    });

    test('updateProduct', async () => {
        const updateData: UpdateFullProductRequestDTO[] = [{
            sku: '12345',
            parent_sku: '54321',
            title: "test titulo",
            category_code: "R1000",
            description: "TEst Producto",
            short_description: "TEst short",
            is_published: true,
        }];

        repo.updateProduct.mockResolvedValueOnce([{
            sku: '12345',
            parentSku: '54321',
            title: "Nuevo Titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        const result: Product[] = await service.updateProduct(updateData);

        expect(repo.updateProduct).toHaveBeenCalledTimes(1);
        expect(repo.updateProduct).toHaveBeenCalledWith(updateData.map(requestDTOtoEntity));

        // Verificamos que el resultado es el esperado
        expect(result).toEqual([{
            sku: '12345',
            parentSku: '54321',
            title: "Nuevo Titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);
    });
});

describe("deleteProduct service", () => {

    test('deleteProduct with repo error', async () => {
        const deleteData: DeleteProductRequestDTO[] = [{
            sku: '12345',
        }];

        //Ahora mockeamos un error con throw
        repo.deleteProduct.mockRejectedValueOnce(new Error('Error al eliminar el producto'));

        // Llamamos al servicio para crear el producto
        await expect(service.deleteProduct(deleteData))
        .rejects.toThrow('Error al eliminar el producto');
    });

    test("deleteProduct", async () => {
        const skuSent = '12345';
        const deleteData: DeleteProductRequestDTO[] = [{
            sku: skuSent,
        }];

        repo.deleteProduct.mockResolvedValueOnce([{
            sku: skuSent,
        }]);

        const result: Product[] = await service.deleteProduct(deleteData);

        expect(repo.deleteProduct).toHaveBeenCalledTimes(1);
        expect(repo.deleteProduct).toHaveBeenCalledWith(deleteData);

        // Verificamos que el resultado es el esperado
        expect(result).toEqual([{
            sku: skuSent,
        }]);
    });
});
