export class ExpiredTokenException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'ExpiredTokenException';
    Object.setPrototypeOf(this, ExpiredTokenException.prototype);
  }
}
