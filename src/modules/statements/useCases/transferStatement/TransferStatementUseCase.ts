import { inject, injectable } from 'tsyringe';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { OperationType } from '../../entities/Statement';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { TransferStatementRequestDto } from './TransferStatementRequestDto';
import { TransferStatementError } from './TransferStatementsError';

@injectable()
export class TransferStatementUseCase {
  constructor(
    @inject('UsersRepository') private usersRepository: IUsersRepository,
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute(request: TransferStatementRequestDto): Promise<void> {
    const { sender_user_id, destination_user_id, amount, description } =
      request;
    const sender = await this.usersRepository.findById(sender_user_id);

    if (!sender) {
      throw new TransferStatementError.UserNotFoundError();
    }

    const destination = await this.usersRepository.findById(
      destination_user_id
    );

    if (!destination) {
      throw new TransferStatementError.UserNotFoundError();
    }

    const { balance: senderBalance } =
      await this.statementsRepository.getUserBalance({
        user_id: sender_user_id,
      });

    if (amount > senderBalance) {
      throw new TransferStatementError.OutOfFundError();
    }

    await this.statementsRepository.create({
      amount,
      description: `Transfered to ${destination.name}`,
      type: OperationType.WITHDRAW,
      user_id: sender.id as string,
    });

    await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: destination.id as string,
      sender_id: sender_user_id,
    });
  }
}
