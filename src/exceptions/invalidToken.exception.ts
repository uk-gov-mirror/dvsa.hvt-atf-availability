export class InvalidTokenException extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'InvalidTokenException';
    Object.setPrototypeOf(this, InvalidTokenException.prototype);
  }
}
