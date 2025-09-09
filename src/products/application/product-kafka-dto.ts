import { AttributeResponseDTO } from "../infrastructure/product-response-dto";

export interface AttributeKafkaDTO {
    name_code?: string;
    name?: string;
    value_code?: string;
    value?: string;
}

export interface ProductKafkaDTO {
    sku: string;
    parent_sku?: string;
    title?: string;
    category_code?: string;
    category_name?: string;
    description?: string;
    short_description?: string;
    is_published?: boolean;
    attributes?: AttributeKafkaDTO[];
}