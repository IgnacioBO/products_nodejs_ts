import ProductService from "../application/product-service";
import ProductRepository from "../domain/product-repository";
import ProductController from './product-controller';
import { makeProductRepoMock } from "../domain/product-repository.mock";
import { ProductResponseDTO } from "./product-response-dto";
import PaginationMetadataResponseDTO from "../../shared/application/pagination-metadata-dto";

//Haremos Test de Integracion (osea probaremos controler + service), pero mockearemos el repo

//Estas variables se usaran en todos los tests asi que lo definieremos aca
let repo : jest.Mocked<ProductRepository>;
let service : ProductService;
let controller : ProductController;

beforeEach(() => {
    //Antes de cada test limpamos los mock e inicializamos repo, serivce y controller.
    jest.clearAllMocks();
    
    repo = makeProductRepoMock();
    service = new ProductService(repo);
    controller = new ProductController(service);
});

describe("getAll products", () => {
    test("success getAll with one product", async () => {

        const skuEsperado = '12345';
        const parentSkuEsperado = '54321';
        const titleEsperado = "test titulo";
        const categoryCodeEsperado = "R1000";
        const descriptionEsperado = "TEst Producto";
        const shortDescriptionEsperado = "TEst short";
        const isPublishedEsperado = true;

        const countEsperado = 1;
        const pageSizeEsperado = 15;
        const pageEsperado = 1;
        const totalCountEsperado = 1;
        const totalPagesEsperado = 1;

        const responseDTOEsprado: ProductResponseDTO[] = [{
            sku: skuEsperado,
            parent_sku: parentSkuEsperado,
            title: titleEsperado,
            category_code: categoryCodeEsperado,
            description: descriptionEsperado,
            short_description: shortDescriptionEsperado,
            is_published: isPublishedEsperado,
        }];

        const metaEsperado: PaginationMetadataResponseDTO = {
            page: pageEsperado,
            count: countEsperado,
            total_count: totalCountEsperado,
            page_size: pageSizeEsperado,
            total_pages: totalPagesEsperado,
        }

        //Mocker repo
        repo.getAllProducts.mockResolvedValueOnce([{
            sku: skuEsperado,
            parentSku: parentSkuEsperado,
            title: titleEsperado,
            categoryCode: categoryCodeEsperado,
            description: descriptionEsperado,
            shortDescription: shortDescriptionEsperado,
            isPublished: isPublishedEsperado,
        }]);

        //Mock repo count
        repo.count.mockResolvedValueOnce(totalCountEsperado);

        //Aqui definimos los mocks de req, res y next
        //Req le ponemos los query
        const req = {
            query: { category: "test", page: pageEsperado, limit: pageSizeEsperado }
        } as any;

        //Res le ponemos el metodo success (ya que se llama dentro de getAll) y ponemos jest.fn() para simular su comportamiento
        const res = {
            success: jest.fn()
        } as any;

        //Next le ponemos jest.fn() para simular su comportamiento
        const next = jest.fn();

        //Llamamos al controlador getAll usando req, res y next
        //NO ponemos una variable que reciba el resultado, porque es void
        //Los datos de errores o resultado estaran dentro de "res" y los de errores dentro de "next"
        await controller.getAll(req, res, next);

        //Esperamos que NEXT no halla sido llamado, porque si es llamado significa que hubo un error
        expect(next).not.toHaveBeenCalled();
        //Esperamos que res.success haya sido llamado, ya que significa que la peticion fue exitosa
        expect(res.success).toHaveBeenCalledTimes(1);

        expect(repo.getAllProducts).toHaveBeenCalledTimes(1);


        //Ahora para acceder a los datos de la respuesta se usara res.success.mock.calls
        //.calls devuelve un array con todas las llamadas al mock, se maneja en una matriz [][]
        //La primera parte de .calls [0] nos da la primera llamada al mock (osea si res.success es llamado multiples veces, estara en [0] luego en [1], etc)
        //La seunda parte de .calls[0][0] indica los argumentos con los que fue llamado el mock en esa primera llamada.
        /* EJEMPLO
            const fn = jest.fn();

            fn("hola", 123);
            fn("chao", 456);

            // fn fue llamado 2 veces
            console.log(fn.mock.calls.length); // 2

            // Primera llamada → argumentos: ["hola", 123]
            console.log(fn.mock.calls[0]); // ["hola", 123]
            console.log(fn.mock.calls[0][0]); // "hola"
            console.log(fn.mock.calls[0][1]); // 123

            // Segunda llamada → argumentos: ["chao", 456]
        console.log(fn.mock.calls[1][0]); // "chao"*/

       // console.log(res.success.mock.calls[0][0]);
        expect(res.success.mock.calls[0][0]).toEqual({
            data: responseDTOEsprado,
            message: "success",
            meta: metaEsperado
        });
    });
    test("success getAll with multiple products and pages", async () => {

        const skuEsperado1 = '12345';
        const parentSkuEsperado1 = '54321';
        const titleEsperado1 = "test titulo";
        const categoryCodeEsperado1 = "R1000";
        const descriptionEsperado1 = "TEst Producto";
        const shortDescriptionEsperado1 = "TEst short";
        const isPublishedEsperado1 = true;

        const skuEsperado2 = '67890';
        const parentSkuEsperado2 = '09876';
        const titleEsperado2 = "test titulo 2";
        const categoryCodeEsperado2 = "R1001";
        const descriptionEsperado2 = "TEst Producto 2";
        const shortDescriptionEsperado2 = "TEst short 2";
        const isPublishedEsperado2 = false;

        const countEsperado = 2;
        const pageSizeEsperado = 2;
        const pageEsperado = 1;
        const totalCountEsperado = 3;
        const totalPagesEsperado = 2;

        const responseDTOEsprado: ProductResponseDTO[] = [{
            sku: skuEsperado1,
            parent_sku: parentSkuEsperado1,
            title: titleEsperado1,
            category_code: categoryCodeEsperado1,
            description: descriptionEsperado1,
            short_description: shortDescriptionEsperado1,
            is_published: isPublishedEsperado1,
        }, {
            sku: skuEsperado2,
            parent_sku: parentSkuEsperado2,
            title: titleEsperado2,
            category_code: categoryCodeEsperado2,
            description: descriptionEsperado2,
            short_description: shortDescriptionEsperado2,
            is_published: isPublishedEsperado2,
        }];

        const metaEsperado: PaginationMetadataResponseDTO = {
            page: pageEsperado,
            count: countEsperado,
            total_count: totalCountEsperado,
            page_size: pageSizeEsperado,
            total_pages: totalPagesEsperado,
        }

        //Mocker repo
        repo.getAllProducts.mockResolvedValueOnce([{
            sku: skuEsperado1,
            parentSku: parentSkuEsperado1,
            title: titleEsperado1,
            categoryCode: categoryCodeEsperado1,
            description: descriptionEsperado1,
            shortDescription: shortDescriptionEsperado1,
            isPublished: isPublishedEsperado1,
        }, {
            sku: skuEsperado2,
            parentSku: parentSkuEsperado2,
            title: titleEsperado2,
            categoryCode: categoryCodeEsperado2,
            description: descriptionEsperado2,
            shortDescription: shortDescriptionEsperado2,
            isPublished: isPublishedEsperado2,
        }]);

        //Mock repo count
        repo.count.mockResolvedValueOnce(totalCountEsperado);

        //Aqui definimos los mocks de req, res y next
        //Req le ponemos los query
        const req = {
            query: { category: "test", page: pageEsperado, limit: pageSizeEsperado }
        } as any;

        //Res le ponemos el metodo success (ya que se llama dentro de getAll) y ponemos jest.fn() para simular su comportamiento
        const res = {
            success: jest.fn()
        } as any;

        //Next le ponemos jest.fn() para simular su comportamiento
        const next = jest.fn();

        //Los datos de errores o resultado estaran dentro de "res" y los de errores dentro de "next"
        await controller.getAll(req, res, next);

        //Esperamos que NEXT no halla sido llamado, porque si es llamado significa que hubo un error
        expect(next).not.toHaveBeenCalled();
        //Esperamos que res.success haya sido llamado, ya que significa que la peticion fue exitosa
        expect(res.success).toHaveBeenCalledTimes(1);

        expect(repo.getAllProducts).toHaveBeenCalledTimes(1);

      //  console.log(res.success.mock.calls[0][0]);
        expect(res.success.mock.calls[0][0]).toEqual({
            data: responseDTOEsprado,
            message: "success",
            meta: metaEsperado
        });
    });

    test("getAll with error with page parameter not a number", async () => {
        const errorEsperado : string = "Page must be a positive number";
        const statusEsperado : number = 500;

        //Mocker repo
        repo.getAllProducts.mockResolvedValueOnce([{
            sku: "12345",
            parentSku: "56789",
            title: "test titulo",
            categoryCode: "R1000",
            description: "TEst Producto",
            shortDescription: "TEst short",
            isPublished: true,
        }]);

        //Mock repo count
        repo.count.mockResolvedValueOnce(1);

        //Aqui definimos los mocks de req, res y next
        //Req le ponemos los query
        const req = {
            query: { category: "test", page: "not-a-number", limit: 10 }
        } as any;

        //Res le ponemos el metodo success (ya que se llama dentro de getAll) y ponemos jest.fn() para simular su comportamiento
        const res = {
            success: jest.fn()
        } as any;

        //Next le ponemos jest.fn() para simular su comportamiento
        const next = jest.fn();

        //Los datos de errores o resultado estaran dentro de "res" y los de errores dentro de "next"
        await controller.getAll(req, res, next);

        expect(res.success).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalledTimes(1);

        //console.log(next.mock.calls[0][0]);

        //Next es llamado y se le pone como argument estrucvtura que es HttpErrors que tiene los campos payload y status
        expect(next.mock.calls[0][0].payload).toContain(errorEsperado);
        expect(next.mock.calls[0][0].status).toBe(statusEsperado);



    });
});

