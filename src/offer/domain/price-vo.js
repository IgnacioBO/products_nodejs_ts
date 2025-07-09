const { validateField } = require("../../shared/domain/utils/generic-functions");

const PriceTypes = Object.freeze({
    ORIGINAL : "ORIGINAL",
    DISCOUNT : "DISCOUNT",
    PROMOTION : "PROMOTION",
})

const CurrencyTypes = Object.freeze({
    CLP: "CLP",
    PE: "PE",
    USD: "USD",
    EUR: "EUR",
});

class Price {
    constructor({ currency, type, value }) {
        validateField(currency, "Currency", "string", true);
        validateField(type, "Type", "string", true);
        validateField(value, "Value", "number", true);

        if (!Object.values(CurrencyTypes).includes(currency)) {
            throw new Error(`Currency must be one of ${Object.values(CurrencyTypes).join(", ")}`);
        }
    
        if (!Object.values(PriceTypes).includes(type)) {
            throw new Error(`Type must be one of ${Object.values(PriceTypes).join(", ")}`);
        }

        this.value = value;
        this.type = type;
        this.currency = currency;
    }

}

module.exports = Price