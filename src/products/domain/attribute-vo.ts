//Esto es un value object que a diferencia de un entity no tiene identidad unica
// y se define por sus atributos (en este caso name_code y value_code)
// y no por su id (como puede ser un sku)
// no tiene identidad unica porque si dos value object tiene los mismos campos y valores son el mismo value object
// Es inmutable, es decir, NO DEBERIA cambiar una vez creado
import { validateField } from '../../shared/domain/utils/generic-functions';

interface IAttribute {
    name_code: string;
    name?: string;
    value_code: string;
    value?: string;
}


class Attribute implements IAttribute {
    name_code: string;
    name?: string;
    value_code: string;
    value?: string;
    constructor(params: IAttribute) {
            validateField(params.name_code, "name_code", "string", true);
            validateField(params.name, "Name", "string", false);
            validateField(params.value_code, "value_code", "string", true);
            validateField(params.value, "Value", "string", false);

            this.name_code    = params.name_code;
            this.name         = params.name;
            this.value_code   = params.value_code;
            this.value        = params.value;
        }
}
export default Attribute;