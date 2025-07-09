//@ts-check
const PaginationMetadata = require('./pagination-metadata.js');

class PaginationMetadataResponseDTO{
    /**
     * @param {PaginationMetadata} paginationMetadata - Objeto de tipo PaginationMetadata
     */
    constructor(paginationMetadata){
        this.page = paginationMetadata.page;
        this.count = paginationMetadata.count
        this.total_count = paginationMetadata.totalCount;
        this.page_size = paginationMetadata.pageSize;
        this.total_pages = paginationMetadata.totalPages;
    }

}

module.exports = PaginationMetadataResponseDTO;