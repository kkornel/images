export type ApplicationExceptionDetails = Readonly<Record<string, unknown>>;

export class ApplicationException extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: ApplicationExceptionDetails,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
