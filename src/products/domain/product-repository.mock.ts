import ProductRepository from "./product-repository";

//Esta funcion lo que hace es crear un mock de ProductRepository
//jest.Mocked<ProductRepository> hace que todos los metodos de ProductRepository sean funciones mockeadas
//jest.fn() crea una funcion mock, osea una funcion que simula el comportamiento de una funcion real
//Luego si quiero simular respuestas de una funxion X puedo usar .mockResolvedValue(<valor>) por ejemplo o .mockReturnValue(<valor>), etc


//Entonces como resumen esta funcion devuelve un mock de ProductRepository ( : jest.Mocked<ProductRepository> )
// Y adentro mockeamos TODAS las funciones porque ProductRepository es una interfaz que requiere implementacion de sus metodos
export function makeProductRepoMock (): jest.Mocked<ProductRepository>  {
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