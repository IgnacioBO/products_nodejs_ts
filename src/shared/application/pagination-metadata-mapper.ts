import PaginationMetadata from './pagination-metadata';
import PaginationMetadataResponseDTO from './pagination-metadata-dto';


export function toPaginationMetadataResponseDTO(paginationMetadata: PaginationMetadata): PaginationMetadataResponseDTO {
  return {
    page: paginationMetadata.page,
    count: paginationMetadata.count,
    total_count: paginationMetadata.totalCount,
    page_size: paginationMetadata.pageSize,
    total_pages: paginationMetadata.totalPages,
  };
}