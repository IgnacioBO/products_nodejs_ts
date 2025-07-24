//Esto es un value object que a diferencia de un entity no tiene identidad unica
// y se define por sus atributos (en este caso name_code y value_code)
// y no por su id (como puede ser un sku)
// no tiene identidad unica porque si dos value object tiene los mismos campos y valores son el mismo value object
// Es inmutable, es decir, NO DEBERIA cambiar una vez creado
import { validateField } from '../../shared/domain/utils/generic-functions';

interface IAttribute {
    nameCode: string;
    name?: string;
    valueCode: string;
    value?: string;
}


class Attribute implements IAttribute {
    nameCode: string;
    name?: string;
    valueCode: string;
    value?: string;
    constructor(params: IAttribute) {
            validateField(params.nameCode, "Name code", "string", true);
            validateField(params.name, "Name", "string", false);
            validateField(params.valueCode, "Value code", "string", true);
            validateField(params.value, "Value", "string", false);

            this.nameCode    = params.nameCode;
            this.name         = params.name;
            this.valueCode   = params.valueCode;
            this.value        = params.value;
        }
}
export default Attribute;