export class ATFOperationException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ATFOperationException';
    Object.setPrototypeOf(this, ATFOperationException.prototype);
  }
}
