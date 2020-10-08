export class ExpiredTokenException extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'ExpiredTokenException';
    Object.setPrototypeOf(this, ExpiredTokenException.prototype);
  }
}
