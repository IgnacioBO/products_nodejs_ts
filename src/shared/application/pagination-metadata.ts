//@ts-check
class PaginationMetadata {
    page: number;
    count?: number;
    totalCount: number;
    pageSize: number;
    totalPages: number;


  constructor(page: number, pageSize: number, totalItems: number, perPageDefault: number, count?: number) {
    if (pageSize <=0){
        pageSize = perPageDefault;
    }
    if (isNaN(pageSize)) {
      throw new Error("Page size must be a positive number.");
    }
    if (isNaN(totalItems)) {
      throw new Error("Total items must be a positive number.");
    }
    if (isNaN(page)) {
      throw new Error("Page must be a positive number.");
    }

    let pageCount = 0;

    if (totalItems >= 0){
        pageCount = Math.ceil(totalItems / pageSize);
        /*if (page > pageCount) {
            page = pageCount;
        }*/
    }

    if (page < 1) {
      page = 1;
    }

    this.totalCount = totalItems;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = pageCount;
    this.count = count;

  }

  get offset() {
    return (this.page - 1) * this.pageSize;
  }

  get limit() {
    return this.pageSize;
  }
}

export default PaginationMetadata;