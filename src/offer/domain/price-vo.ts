import { validateField } from "../../shared/domain/utils/generic-functions";

export enum CurrencyType {
  CLP = 'CLP',
  PE  = 'PE',
  USD = 'USD',
  EUR = 'EUR',
}

export enum PriceType {
  ORIGINAL  = 'ORIGINAL',
  DISCOUNT  = 'DISCOUNT',
  PROMOTION = 'PROMOTION',
}

interface IPrice{
  currency: CurrencyType;
  type: PriceType;
  value: number;
}


export class Price implements IPrice {
    currency: CurrencyType;
    type: PriceType;
    value: number;
    constructor( params : IPrice ) {
        validateField(params.currency, "Currency", "string", true);
        validateField(params.type, "Type", "string", true);
        validateField(params.value, "Value", "number", true);

        // Validamos que el currency y el type sean de los tipos permitidos
        if (!Object.values(CurrencyType).includes(params.currency)) {
            throw new Error(`Currency must be one of ${Object.values(CurrencyType).join(", ")}`);
        }

        if (!Object.values(PriceType).includes(params.type)) {
            throw new Error(`Type must be one of ${Object.values(PriceType).join(", ")}`);
        }

        this.value = params.value;
        this.type = params.type;
        this.currency = params.currency;
    }

}

export default Price