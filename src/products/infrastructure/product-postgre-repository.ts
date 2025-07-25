//@ts-check
import pool from '../../shared/infrastructure/config/database';
import Product from '../domain/product-entity';
import ProductAttribute from '../domain/attribute-vo';
import Attribute from '../domain/attribute-vo';
import ProductRepository from '../domain/product-repository';
import { ProductoNotFoundError, ProductWithSKUAlreadyExistsError } from '../domain/product-errors';
import ProductFilters from '../domain/product-filters';
import {ProductPostgreDTO} from './product-postgre-dto';
import { productToPostgreDTO, rowToProduct } from './product-postgre-mapper';
import PaginationParams from '../../shared/domain/paginations-params-vo';
import { QueryResult, DatabaseError } from 'pg';

//Aqui la clase PostgreProductRepository implementa la interfaz ProductRepository
//Esto sería tecnicametne lo que se conoce como un "adaptador" de salida en la arquitectura hexagonal 
//Que implementa el "puerto" de salida definido por la interfaz ProductRepository
//Interface ProductRepository: Puerto de salida (como maqueta de lo que debe hacer un repositorio de productos)
// PostgreProductRepository: Adaptador de salida que implementa las funciones del puerto de salida
/** 
 * @implements {ProductRepository} 
 */
class PostgreProductRepository implements ProductRepository {
    static SQL_SELECT_BASE: string = `
        SELECT
        p.sku,
        p.parent_sku,
        p.title,
        p.category_code as category_code,
        c.category_name,
        p.description,
        p.short_description,
        p.is_published,
        COALESCE(
            JSON_AGG(
            JSON_BUILD_OBJECT(
                'name_code', pa.name_code,
                'name',       a.name,
                'value_code', pa.value_code,
                'value',      v.value
            )
            ) FILTER (WHERE pa.sku IS NOT NULL),
            '[]'
        ) AS attributes
        FROM products p
        LEFT JOIN categories c       ON p.category_code = c.category_code 
        LEFT JOIN products_attributes pa ON p.sku = pa.sku
        LEFT JOIN attributes a       ON pa.name_code  = a.name_code
        LEFT JOIN value_list v       ON pa.value_code = v.value_code
        
    `;
    //Aqui leyendo de adenrto hacia fuera:
    // JSON_BUILD_OBJECT hace un objeto JSON con los atributos
    // Luego JSON AGG hace un ARRAY de objetos JSON con los atributos
    // JSON FILTER hace un where que descarta cualquier fila en que pa.sku sea NULL
    //COALESCE (JSON_AGG(...) JSON FIILTER (...), '[]') es para devolver un array vacio [] en caso de que no haya atributos
    //La función COALESCE(arg1, arg2, …) evalúa los argumentos de izquierda a derecha y devuelve el primer valor que no sea NULL. Si todos los argumentos son NULL, retorna NULL
    //Entonces en este caso, COALESCE( JSON_AGG(... ) FILTER(...), '[]' ) significa que si JSON_AGG produce NULL (porque no hay filas de atributos asociadas), entonces se usará el literal '[]' en su lugar

    static SQL_COUNT_BASE: string = `
        SELECT COUNT(*)
        FROM products p        
    `;

    async getAllProducts(productFilters: ProductFilters, paginationParams: PaginationParams) : Promise<Product[]> {

        //Wherfilter devueelve la clause y los params para la consulta SQL
        const whereFilter = this._generateWhereFilters(productFilters, "p.");

        const result: QueryResult<any> = await pool.query(
            `${PostgreProductRepository.SQL_SELECT_BASE}
            ${whereFilter.clause}
            GROUP BY p.sku, p.parent_sku, p.title, p.category_code, c.category_name, p.description, p.is_published
            LIMIT ${paginationParams.limit} OFFSET ${paginationParams.offset};`,
            whereFilter.params
        );

        // Devolvemos directamente las filas con results.rows
        //Esto devuevle las fila en un array de objetos, donde cada objeto es una fila de la tabla
        //Si quiero acceder a una fila en concreto, lo puedo hacer con result.rows[0]
        //console.log(result.rows[0]);
        //Si quiero obtener los nombres de las columnas, lo puedo hacer con result.fields

        //console.log(result.rows[0].sku);
        //console.log(result.fields[0]);
        //console.log(result.rows);

        //Obtenemos las filas de productRepository que devolvera un array de objetos
        let rows = result.rows

        /* AHORA MAPEAMOS LOS RESULTADOS A UN ARRAY DE PRODUCTOS */
        //Mapear a objetos Product
        //rows.map es un metodo de array que nos permite transformar cada elemento del array en otro elemento
        //Osea recorrer el array y aplicar una funcion a cada elemento del array
        //Es como un foreach pero en vez de recorrer el array y hacer algo con cada elemento
        // lo que hace es recorrer el array y devolver un *nuevo array* con los resultados de la funcion que le pasamos como parametro
        //En este caso, lo que hacemos es recorrer el array de filas y por cada fila, llamamos a la funcion _mapRowToProduct que nos devuelve un objeto Product
        //Asi se llamara a la funcion una x cantidad de veces como filas haya en el array
        //El resultado de este map es un nuevo array de objetos Product, que es lo que queremos devolver
        return rows.map(rowToProduct)
    }

    async count(productFilters: ProductFilters): Promise<number> {
        
        //Wherfilter devueelve la clause y los params para la consulta SQL
        const whereFilter = this._generateWhereFilters(productFilters, "p.");

        const result = await pool.query(
            `${PostgreProductRepository.SQL_COUNT_BASE}
            ${whereFilter.clause};`,
            whereFilter.params
        );

        const count: number = parseInt(result.rows[0].count);
    
        if (isNaN(count)) {
            //TODO: Crear un error especifico para esto
            throw new Error('Error trying to count: ' + count);
        }

        return count;
    }

    async getProductBySku(sku: string): Promise<Product[]> {
        const result = await pool.query(
            `${PostgreProductRepository.SQL_SELECT_BASE}
            WHERE p.sku = $1
            GROUP BY p.sku, p.parent_sku, p.title, p.category_code, c.category_name, p.description, p.is_published;`, 
            [sku]);
            if(result.rowCount === 0) {
                throw new ProductoNotFoundError(sku);
                //throw new Error('No se encontro el producto con el sku: ' + sku);
            }

            let rows = result.rows
            return rows.map(rowToProduct);
    }

    async createProduct(products : Product[]): Promise<Product[]> {
        //Aqui para hacer el insert, como queremos insertar en 2 tablas (products y products_attributes)
        //En vez de usar pool.query 2 veces, lo que hacemos es usar una transaccion
        //Esto usando el metodo pool.query y pasandole un array de queries
        //El primer query es el insert en la tabla products y el segundo es el insert en la tabla products_attributes
    
        const productsDTO : ProductPostgreDTO[] = products.map(productToPostgreDTO);

        //pool.connect() es un metodo que nos permite conectarnos a la base de datos y obtener un cliente
        const client = await pool.connect();
        try {
            //Iniciamos la transaccion
            await client.query('BEGIN');
            //Haremos un for para recorrer el array de productos y por cada producto haremos un insert en la tabla products
            //Y por cada producto haremos un insert en la tabla products_attributes
            const createdProducts: any[] = [];
            for (const product of productsDTO) {
                try{
                    //Hacemos el primer insert en la tabla products
                    const resultProd = await client.query(
                    `INSERT INTO products (sku, parent_sku, title, category_code, description, is_published, short_description)
                    VALUES ($1,$2,$3,$4,$5,$6,$7)
                    RETURNING *;`,
                    [product.sku, product.parent_sku, product.title, product.category_code, product.description, product.is_published, product.short_description]
                    );
                    createdProducts.push(resultProd.rows[0]);

                    //Hacemos el segundo insert en la tabla products_attributes
                    const createdAttributes: any[] = [];
                    for (const atributo of product.attributes || []) {
                        const resultAttr = await client.query(
                        `INSERT INTO products_attributes (sku, name_code, value_code)
                        VALUES ($1, $2, $3)
                        RETURNING *;`,
                        [product.sku, atributo.name_code, atributo.value_code]
                        );
                        //Ahora agregamos el atributo creado al array de atributos creados
                        createdAttributes.push(resultAttr.rows[0]);
                    }
                
                    //Ahora asignamos los atributos creados al producto creado
                    //Como no tenemos el indice del producto creado, lo que hacemos es usar el length del array de productos creados - 1
                    //Ya que asi seguramos que agregamos los atributos al producto que acabamos de crear
                    createdProducts[createdProducts.length - 1].attributes = createdAttributes;
                } catch (error: unknown) {
                    //Si el error es de tipo DatabaseError, significa que hubo un error en la base de datos
                    if (error instanceof DatabaseError) {
                        if (error.code === '23505') {
                            throw new ProductWithSKUAlreadyExistsError(product.sku);
                        }
                        throw new Error(`Error al crear el producto con sku ${product.sku}: ${error.message}`);
                    }
                    if (error instanceof Error) {
                        throw new Error(`Error al crear el producto con sku ${product.sku}: ${error.message}`)
                    }
                    throw error;
                }
            }

            //Ahora hacemos el commit de la transaccion, osea si todos los clients.query han ido bien, hacemos el commit
            await client.query('COMMIT');
            //Devolvemos el producto creado y los atributos creados
            //AL createdProduct lo ponemos entre [] para que sea un array de un solo elemento y asi poder mapearlo a objeto Product
            return createdProducts.map(rowToProduct)
        } catch (error) {
            await client.query('ROLLBACK'); // Si hay un error, hacemos rollback de la transaccion
        
            throw error; // Lanza el error para que lo maneje el controlador
          } finally {
            client.release();
          }

    }

    async updateFullProduct(products: Product[]): Promise<Product[]> {
        const productsDTO = products.map(productToPostgreDTO);

        const client = await pool.connect();
        try {
            //Iniciamos la transaccion
            await client.query('BEGIN');
            //Haremos un for para recorrer el array de productos y por cada producto haremos un insert en la tabla products
            //Y por cada producto haremos un insert en la tabla products_attributes
            const updatedProducts = [];
            for (const product of productsDTO) {
                try{
                    //Primero borramos los atributos del producto
                    let queryAttr = `DELETE from products_attributes WHERE sku = $1;`;
                    await client.query(queryAttr, [product.sku]);

                    //Ahora hacemos el update en la tabla products
                    const resultProd = await client.query(
                    `UPDATE products SET parent_sku = $2, title = $3, category_code = $4, description = $5, is_published = $6, short_description = $7
                    WHERE sku = $1 RETURNING *;`,
                    [product.sku, product.parent_sku, product.title, product.category_code, product.description, product.is_published, product.short_description]
                    );
                    if(resultProd.rowCount === 0) {
                        throw new ProductoNotFoundError(product.sku);
                    }
                    updatedProducts.push(resultProd.rows[0]);

                    //Hacemos el segundo insert en la tabla products_attributes
                    const updatedAttributes = [];
                    for (const atributo of product.attributes || []) {
                        const resultAttr = await client.query(
                        `INSERT INTO products_attributes (sku, name_code, value_code)
                        VALUES ($1, $2, $3)
                        RETURNING *;`,
                        [product.sku, atributo.name_code, atributo.value_code]
                        );
                        //Ahora agregamos el atributo creado al array de atributos creados
                        updatedAttributes.push(resultAttr.rows[0]);
                    }
                
                    //Ahora asignamos los atributos creados al producto creado
                    //Como no tenemos el indice del producto creado, lo que hacemos es usar el length del array de productos creados - 1
                    //Ya que asi seguramos que agregamos los atributos al producto que acabamos de crear
                    updatedProducts[updatedProducts.length - 1].attributes = updatedAttributes;
                } catch (error) {
                    if(error instanceof ProductoNotFoundError) {
                        throw error;
                    }
                    if(error instanceof Error) {
                        throw new Error(`Error al actualizar el producto con sku ${product.sku}: ${error.message}`);
                    }
                    throw error;
                }
            }

            //Ahora hacemos el commit de la transaccion, osea si todos los clients.query han ido bien, hacemos el commit
            await client.query('COMMIT');
            //Devolvemos el producto creado y los atributos creados
            //AL createdProduct lo ponemos entre [] para que sea un array de un solo elemento y asi poder mapearlo a objeto Product
            return updatedProducts.map(rowToProduct)
        } catch (error) {
            await client.query('ROLLBACK'); // Si hay un error, hacemos rollback de la transaccion
        
            throw error; // Lanza el error para que lo maneje el controlador
          } finally {
            client.release();
          }

    }

    async updateProduct(products: Product[]): Promise<Product[]> {
        const productsDTO = products.map(productToPostgreDTO);
        const client = await pool.connect();
        try {
            //Iniciamos la transaccion
            await client.query('BEGIN');
            const updatedProducts = [];
            for (const product of productsDTO) {
                try{
                    let query = `UPDATE products SET `;
                    //values tendra los valores que vamos a actualizar
                    let values = [];
                    //setClauses tendra los set de la query, osea los campos que vamos a actualizar (title, description, etc)
                    let setClauses = [];
                    //Index es el indice de los valores que vamos a actualizar, osea el $1, $2, $3, etc
                    let index = 1;
                    //Recorremos el objeto product y por cada propiedad que no sea sku, creamos un setClause y lo agregamos al array de setClauses
                    //Ademas agregamos el valor al array de values
                    for (const [key, val] of Object.entries(product)) {
                        //Ignoramos las propiedades sku y attributes (sku porque es la clave primaria y attributes porque es una tabla aparte)
                        if (key !== 'sku' && key !== 'attributes') {
                            //Si el valor es undefined (o null [por eso !=]), lo ignoramos
                            if (val != undefined) {
                                setClauses.push(`${key} = $${index}`);
                                values.push(val);
                                index++;
                            }
                        }
                    }

                    //Agregamos el where al query, en el where se ponde el index, que sera el ultimo valor que agregamos al array de values y corresponde al sku
                    query += setClauses.join(', ') + ` WHERE sku = $${index} RETURNING *;`;        
                    //Agregamos el sku al array de values al final, ya que es el ultimo valor que vamos a usar en el where
                    values.push(product.sku);
                    //Ejecutamos el query
                    const resultProd = await client.query(query, values);
                    if(resultProd.rowCount === 0) {
                        throw new ProductoNotFoundError(product.sku);
                    }
                    updatedProducts.push(resultProd.rows[0]);
                    //Hacemos el segundo insert en la tabla products_attributes
                    const updatedAttributes = [];
                    for (const atributo of product.attributes || []) {
                        //Hacemos el insert en la tabla products_attributes
                        //Usamos ON CONFLICT para evitar duplicados y hacer un update si ya existe el atributo (par sku y name_code)
                        let queryAttr = `INSERT INTO products_attributes (sku, name_code, value_code) 
                                        VALUES ($1, $2, $3) 
                                        ON CONFLICT (sku, name_code) 
                                        DO UPDATE SET value_code = $3
                                        RETURNING *;`;
                        let valuesAttr = [product.sku, atributo.name_code, atributo.value_code];
                
                        const resultAttr = await client.query(queryAttr, valuesAttr);
                        //Ahora agregamos el atributo creado al array de atributos creados
                        updatedAttributes.push(resultAttr.rows[0]);
                    }
                
                
                    updatedProducts[updatedProducts.length - 1].attributes = updatedAttributes;
                } catch (error) {
                    if(error instanceof ProductoNotFoundError) {
                        throw error;
                    }
                    if(error instanceof Error) {
                        throw new Error(`Error al actualizar el producto con sku ${product.sku}: ${error.message}`);
                    }
                    throw error;
                }
            }

            //Ahora hacemos el commit de la transaccion, osea si todos los clients.query han ido bien, hacemos el commit
            await client.query('COMMIT');
            //Devolvemos el producto creado y los atributos creados
            //AL updatedProducts lo ponemos entre [] para que sea un array de un solo elemento y asi poder mapearlo a objeto Product
            return updatedProducts.map(rowToProduct)

        } catch (error: unknown) {
            await client.query('ROLLBACK'); // Si hay un error, hacemos rollback de la transaccion
        
            throw error; // Lanza el error para que lo maneje el controlador
          } finally {
            client.release();
          }
    }
    

    async deleteProduct(products: Product[]): Promise<Product[]> {
        const productsDTO = products.map(productToPostgreDTO);

        const client = await pool.connect();
        try {
            //Iniciamos la transaccion
            await client.query('BEGIN');
            const deletedProducts = [];
            for (const product of productsDTO) {
                try{
                    let queryAttr = `DELETE from products_attributes WHERE sku = $1 RETURNING *;`;
                    let query = `DELETE from products WHERE sku = $1 RETURNING sku;`; 

                    const resultAttr = await client.query(queryAttr, [product.sku]);
                    const resultProd = await client.query(query, [product.sku]);
                    if(resultProd.rowCount === 0) {
                        throw new ProductoNotFoundError(product.sku);
                    }
                    deletedProducts.push(resultProd.rows[0]);
                } catch (error) {
                    if(error instanceof ProductoNotFoundError) {
                        throw error;
                    }
                    if(error instanceof Error) {
                        throw new Error(`Error al eliminar el producto con sku ${product.sku}: ${error.message}`);
                    }
                    throw error;
                }
            }
            await client.query('COMMIT');
            //AL updatedProducts lo ponemos entre [] para que sea un array de un solo elemento y asi poder mapearlo a objeto Product
            return deletedProducts.map(rowToProduct)

        } catch (error) {
            await client.query('ROLLBACK'); // Si hay un error, hacemos rollback de la transaccion
        
            throw error; // Lanza el error para que lo maneje el controlador
          } finally {
            client.release();
          }
    }

    _generateWhereFilters(productFilters: ProductFilters, prefix: string = "") : {clause: string, params: Array<any>} {
        //Aqui generamos los filtros para la consulta SQL
        let whereFilter: string = 'WHERE 1=1'; // 1=1 es una forma de decir que siempre se cumple la condicion, osea que no hay filtros
        let clauses: string[] = []; //Array de clausulas para los filtros, osea los AND que se van a agregar a la consulta SQL
        let params: any[] = []; //Los valores de los filtros, osea los $1, $2, $3, etc que se van a agregar a la consulta SQL
        let index: number = 1; //Index para los valores de los filtros, osea el $1, $2, $3, asi evitamos inyecciones SQL

        for (const [key, val] of Object.entries(productFilters)) {
            if (val != undefined) {
                //Si el valor es un string, lo agregamos a la consulta SQL con comillas simples
                if(typeof val === "string" && val.trim() === ""){     
                    continue; //Si el valor es un string vacio, lo ignoramos            
                }
                else{
                    clauses.push(`${prefix}${key} = $${index}`);
                    params.push(val);
                    index++;
                }
            }
        }
        //Si hay filtros, los agregamos a la consulta SQL
        if (clauses.length > 0) {
            whereFilter += ' AND ' + clauses.join(' AND ');
        }

        return {
            clause: whereFilter,
            params: params
        };       
    }

}

export default PostgreProductRepository;