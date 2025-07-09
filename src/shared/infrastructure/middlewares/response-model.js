class Response {
    constructor({
       status,
       errors,
       message,
       data,
       meta,
      }) {
        this.status = status;
        this.errors = errors;
        this.message = message;
        this.data = data;
        this.meta = meta;
        }
 
}
module.exports = Response;