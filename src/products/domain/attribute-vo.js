//@ts-check
//Esto es un value object que a diferencia de un entity no tiene identidad unica
// y se define por sus atributos (en este caso name_code y value_code)
// y no por su id (como puede ser un sku)
// no tiene identidad unica porque si dos value object tiene los mismos campos y valores son el mismo value object
// Es inmutable, es decir, NO DEBERIA cambiar una vez creado
const { validateField } = require('../../shared/domain/utils/generic-functions.js');
class Attribute {
    constructor({
        name_code,
        name = undefined,
        value_code,
        value = undefined
      }) {
            validateField(name_code, "name_code", "string", true);
            validateField(name, "Name", "string", false);
            validateField(value_code, "value_code", "string", true);
            validateField(value, "Value", "string", false);

            ///Object.assign permite asignar propiedades de un objeto a otro objeto
            //En este caso lo hacemos para asignar las propiedades del objeto que se pasa como argumento a la instancia de la clase
            Object.assign(this, {
                name_code,
                name,
                value_code,
                value
            });
        
        }    
}
module.exports = Attribute;