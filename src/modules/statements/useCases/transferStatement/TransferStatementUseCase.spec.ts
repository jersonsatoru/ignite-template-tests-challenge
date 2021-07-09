import { send } from 'process';
import { v4 } from 'uuid';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { TransferStatementError } from './TransferStatementsError';
import { TransferStatementUseCase } from './TransferStatementUseCase';

let transferStatementUseCase: TransferStatementUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;

describe('Transfer statement use case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    transferStatementUseCase = new TransferStatementUseCase(
      usersRepository,
      statementsRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('Should not be able to transfer if sender user not exist', async () => {
    await expect(
      transferStatementUseCase.execute({
        amount: 100,
        description: 'Payment',
        destination_user_id: v4(),
        send_user_id: v4(),
      })
    ).rejects.toEqual(new TransferStatementError.UserNotFoundError());
  });

  it('Should not be able to transfer if destination user not exist', async () => {
    await expect(
      transferStatementUseCase.execute({
        amount: 100,
        description: 'Payment',
        destination_user_id: v4(),
        send_user_id: v4(),
      })
    ).rejects.toEqual(new TransferStatementError.UserNotFoundError());
  });

  it('Should be able to do a transfer statement', async () => {
    const sender = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson Uyekita',
      password: '234234',
    });

    const destination = await createUserUseCase.execute({
      email: 'sabrinagalvao@gmail.com',
      name: 'Sabrina Galvão',
      password: '234234',
    });

    await createStatementUseCase.execute({
      amount: 1000,
      description: 'Batata chips',
      type: OperationType.DEPOSIT,
      user_id: sender.id as string,
    });

    await transferStatementUseCase.execute({
      amount: 100,
      description: 'Payment',
      destination_user_id: destination.id as string,
      send_user_id: sender.id as string,
    });

    const { balance: sendBalance } = await statementsRepository.getUserBalance({
      user_id: sender.id as string,
    });

    const { balance: destinationBalance } =
      await statementsRepository.getUserBalance({
        user_id: destination.id as string,
      });

    expect(sendBalance).toBe(900);
    expect(destinationBalance).toBe(100);
  });

  it('Should not be able to transfer with not enough balance', async () => {
    const sender = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson Uyekita',
      password: '234234',
    });

    const destination = await createUserUseCase.execute({
      email: 'sabrinagalvao@gmail.com',
      name: 'Sabrina Galvão',
      password: '234234',
    });

    await createStatementUseCase.execute({
      amount: 200,
      description: 'Batata chips',
      type: OperationType.DEPOSIT,
      user_id: sender.id as string,
    });

    await expect(
      transferStatementUseCase.execute({
        amount: 300,
        description: 'Payment',
        destination_user_id: destination.id as string,
        send_user_id: sender.id as string,
      })
    ).rejects.toEqual(new TransferStatementError.OutOfFundError());
  });
});
