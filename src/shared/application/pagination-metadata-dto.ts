import PaginationMetadata from './pagination-metadata';

interface PaginationMetadataResponseDTO{
    page: number;
    count?: number;
    total_count: number;
    page_size: number;
    total_pages: number;

}

export default PaginationMetadataResponseDTO;