import { AppError } from '../../../../shared/errors/AppError';

export namespace TransferStatementError {
  export class UserNotFoundError extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }

  export class OutOfFundError extends AppError {
    constructor() {
      super('User not found', 404);
    }
  }
}
