export class ApiError extends Error {
  status: number;
  success: false;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.success = false;
  }
}
