/*Archivo de Configuraciones que necesitaremos cuando generemos el Docker
Todo esto para Postgres
Por ejemplo crear la BBDD*/

/*Crea la base de datos products*/
CREATE DATABASE products;
/**Conectamos a la base de datos products*/
\c products

CREATE TABLE categories (
  category_code VARCHAR(45) PRIMARY KEY,
  category_name VARCHAR(45) NOT NULL,
  category_name_code VARCHAR(45) NOT NULL
);

CREATE TABLE attributes (
  name_code VARCHAR(45) PRIMARY KEY,
  name VARCHAR(45) NOT NULL
);

CREATE TABLE categories_attributes (
  category_code VARCHAR(45) NOT NULL,
  name_code VARCHAR(45) NOT NULL,
  FOREIGN KEY (category_code) REFERENCES categories(category_code),
  FOREIGN KEY (name_code) REFERENCES attributes(name_code)
);

CREATE TABLE value_list(
  value_code VARCHAR(45) PRIMARY KEY,
  value VARCHAR(45) NOT NULL
);

CREATE TABLE attributes_value_list (
  name_code VARCHAR(45) NOT NULL,
  value_code VARCHAR(45) NOT NULL,
  FOREIGN KEY (name_code) REFERENCES attributes(name_code),
  FOREIGN KEY (value_code) REFERENCES value_list(value_code)
);

/*Crea tabla product*/
/*Foreign key attributes name_code */
CREATE TABLE products (
  sku VARCHAR(16) PRIMARY KEY,
  parent_sku VARCHAR(16),
  category_code VARCHAR(45) NOT NULL,
  title VARCHAR(250),
  description VARCHAR(1200),
  short_description VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (category_code) REFERENCES categories(category_code)
);

/*Tabla intermedia y producto puede tener multiples atributos*/
CREATE TABLE products_attributes (
  sku VARCHAR(16) NOT NULL,
  name_code VARCHAR(45) NOT NULL,
  value_code VARCHAR(45) NOT NULL,
  FOREIGN KEY (sku) REFERENCES products(sku),
  FOREIGN KEY (name_code) REFERENCES attributes(name_code),
  PRIMARY KEY (sku, name_code)
);


/*Genrar datos basicos para la tabla categories*/
INSERT INTO categories (category_code, category_name, category_name_code) VALUES
('cat1', 'Electronics', 'electronics'),
('cat2', 'Books', 'books'),
('cat3', 'Clothing', 'clothing'),
('cat4', 'Toys', 'toys'),
('cat5', 'Sports', 'sports');

/*Generar datos para la tabla attributes*/
INSERT INTO attributes (name_code, name) VALUES
('color', 'Color'),
('size', 'Size'),
('brand', 'Brand'),
('material', 'Material'),
('style', 'Style');

/*Generar datos para la tabla value_list*/
INSERT INTO value_list (value_code, value) VALUES
('red', 'Red'),
('blue', 'Blue'),
('green', 'Green'),
('light_blue', 'Light Blue'),
('black', 'Black'),
('small', 'Small'),
('medium', 'Medium'),
('large', 'Large'),
('nike', 'Nike'),
('adidas', 'Adidas'),
('cotton', 'Cotton'),
('carton', 'Carton'),
('denim', 'Denim'),
('casual', 'Casual'),
('formal', 'Formal');

/*Generar datos para la tabla categories_attributes, todos tienen como  obligatorio el color y luego otros atributos*/
INSERT INTO categories_attributes (category_code, name_code) VALUES
('cat1', 'color'),
('cat1', 'size'),
('cat1', 'brand'),
('cat2', 'color'),
('cat2', 'style'),
('cat3', 'color'),
('cat3', 'size'),
('cat4', 'color'),
('cat4', 'style'),
('cat5', 'color'),
('cat5', 'brand');

/*Generar datos para la tabla attributes_value_list, todos los atributos tienen un valor por defecto*/
INSERT INTO attributes_value_list (name_code, value_code) VALUES
('color', 'red'),
('color', 'blue'),
('color', 'green'),
('size', 'small'),
('size', 'medium'),
('size', 'large'),
('brand', 'nike'),
('brand', 'adidas'),
('material', 'cotton'),
('material', 'denim'),
('material', 'carton'),
('style', 'casual'),
('style', 'formal');

/*Generar datos para la tabla products*/
INSERT INTO products (sku, parent_sku, category_code, title, description, is_published) VALUES
('prod1', NULL, 'cat1', 'Smartphone', 'Latest model with advanced features', TRUE),
('prod2', NULL, 'cat2', 'Book', 'A thrilling mystery novel', TRUE),
('prod3', NULL, 'cat3', 'T-shirt', 'Comfortable cotton t-shirt', TRUE),
('prod4', NULL, 'cat4', 'Toy Car', 'Remote control toy car for kids', TRUE),
('prod5', NULL, 'cat5', 'Soccer Ball', 'Official size soccer ball for practice', TRUE),
('MPM12311310900-1', 'MPM12311310900', 'cat2', 'Harry Potter','A book about a wizard', TRUE),
('MPM12311310900-2', 'MPM12311310900', 'cat2', 'Harry Potter 2','A book about a wizard', TRUE),
('MPM12311310900-3', 'MPM12311310900', 'cat2', 'Harry Potter 3','A book about a wizard', FALSE),
('MPM12311310900', NULL, 'cat3', 'Polera Sin Atributos','Nada de atributos compadre', FALSE);

/*Generar datos para la tabla products_attributes, cada producto tiene un atributo por defecto*/
INSERT INTO products_attributes (sku, name_code, value_code) VALUES
('prod1', 'color', 'blue'),
('prod1', 'size', 'medium'),
('prod1', 'brand', 'nike'),
('prod2', 'color', 'black'),
('prod2', 'size', 'large'),
('prod3', 'color', 'red'),
('prod3', 'size', 'small'),
('prod4', 'color', 'blue'),
('prod4', 'size', 'large'),
('prod5', 'color', 'white'),
('prod5', 'size', 'medium'),
('prod5', 'brand', 'nike'),
('prod5', 'material', 'cotton'),
('prod5', 'style', 'casual');

/*Ähora agregmaos size y material la los libros d harry potter*/
INSERT INTO products_attributes (sku, name_code, value_code) VALUES
('MPM12311310900-1', 'size', 'small'),
('MPM12311310900-1', 'material', 'carton'),
('MPM12311310900-2', 'size', 'medium'),
('MPM12311310900-2', 'material', 'carton'),
('MPM12311310900-3', 'size', 'large'),
('MPM12311310900-3', 'material', 'carton');


/*Hacer un select donde se vea el producto con sus atributos asociados*/
SELECT p.sku,  p.title, p.category_code, c.category_name, p.description, p.is_published,
       pa.name_code as attribute_code, a.name AS attribute_name, pa.value_code as value_code, 
       v.value AS attribute_value
FROM products p
left join categories c on p.category_code = c.category_code 
left JOIN products_attributes pa ON p.sku = pa.sku
left JOIN attributes a ON pa.name_code = a.name_code
left JOIN value_list v ON pa.value_code = v.value_code;