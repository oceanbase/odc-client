export class InterceptedError extends Error {
  constructor(e, public method: string, public uuid: string, public submit: boolean = true) {
    super(e);
  }
}
