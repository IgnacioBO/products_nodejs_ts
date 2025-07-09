
class PaginationsParams{
    /** 
    @param {number} offset 
    @param {number} limit 
    */
    constructor(offset, limit) {
        this.offset = offset;
        this.limit = limit;
    }
}

module.exports = PaginationsParams;