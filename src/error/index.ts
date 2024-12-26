export class CannotRegisterCourse extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  public constructor(message: string) {
    super(message);
  }
}
