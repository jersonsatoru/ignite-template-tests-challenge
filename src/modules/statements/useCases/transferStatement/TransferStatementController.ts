import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { TransferStatementUseCase } from './TransferStatementUseCase';

export class TransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const {
      user: { id: sender_user_id },
      params: { id: destination_user_id },
      body: { amount, description },
    } = request;

    const useCase = container.resolve(TransferStatementUseCase);
    await useCase.execute({
      amount,
      description,
      destination_user_id,
      sender_user_id,
    });

    return response.send();
  }
}
