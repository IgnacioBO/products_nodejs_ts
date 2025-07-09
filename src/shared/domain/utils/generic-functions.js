
//@ts-check
function validateField(field, fieldName, type, required = false) {
    type = type.toLowerCase();

    if (required && (field === undefined || field === null)) {
      throw new Error(`${fieldName} is required`);
    }
    //Se cambio type of a field.constructor.name.toLowerCase(). Lo malo es que el ultimo no maneja null o undefined OJO
    if (field !== undefined && field !== null && field.constructor.name.toLowerCase() !== type) {
      throw new Error(`${fieldName} must be a ${type} type. [Current type: ${field.constructor.name}]`);
    }
}

function validateArrayField(field, fieldName, type, required = false) {
    type = type.toLowerCase();

    if (required && (field === undefined || field === null)) {
      throw new Error(`${fieldName} is required`);
    }
    else if (field !== undefined && field !== null) {
        if (!Array.isArray(field)) {
            throw new Error(`${fieldName} must be an array. Current type: ${typeof field}`);
        }
        if(field.length === 0) {
            throw new Error(`${fieldName} must be an array with at least one element`);
        }
        field.forEach(function (item) {
            if (item !== undefined && item !== null && item.constructor.name.toLowerCase() !== type) {
                throw new Error(`Items of ${fieldName} must be a ${type} type. [Current type: ${item.constructor.name}]`);
            }
        })
    }
}
//export
module.exports = {
    validateField,
    validateArrayField
};