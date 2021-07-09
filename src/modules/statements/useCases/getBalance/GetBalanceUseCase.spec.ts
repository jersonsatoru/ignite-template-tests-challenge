import { v4 } from 'uuid';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { TransferStatementUseCase } from '../transferStatement/TransferStatementUseCase';
import { GetBalanceError } from './GetBalanceError';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let getBalanceUseCase: GetBalanceUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let transferStatementUseCase: TransferStatementUseCase;

describe('Get balance', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
    transferStatementUseCase = new TransferStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('Should not be able to get a balance from a nonexistent account', async () => {
    await expect(getBalanceUseCase.execute({ user_id: v4() })).rejects.toEqual(
      new GetBalanceError()
    );
  });

  it('Should be able to get the correct balance from user', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password: '234234',
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: 'Batata frita',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    });

    await createStatementUseCase.execute({
      amount: 70,
      description: 'Batata frita',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    });

    await createStatementUseCase.execute({
      amount: 25,
      description: 'Batata frita',
      type: OperationType.WITHDRAW,
      user_id: jerson.id as string,
    });

    const { balance } = await getBalanceUseCase.execute({
      user_id: jerson.id as string,
    });
    expect(balance).toBe(145);
  });

  it('Should be able to get the balance and the statements', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password: '234234',
    });

    const sabrina = await createUserUseCase.execute({
      email: 'sabrinagalvao@gmail.com',
      name: 'Sabrina Galvão',
      password: '234234',
    });

    await createStatementUseCase.execute({
      amount: 1000,
      description: 'Batata frita',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    });

    await createStatementUseCase.execute({
      amount: 1000,
      description: 'Batata frita',
      type: OperationType.DEPOSIT,
      user_id: sabrina.id as string,
    });

    await transferStatementUseCase.execute({
      amount: 500,
      description: 'PIX',
      destination_user_id: sabrina.id as string,
      sender_user_id: jerson.id as string,
    });

    const sabrinaBalance = await statementsRepository.getUserBalance({
      user_id: sabrina.id as string,
      with_statement: true,
    });

    expect(sabrinaBalance).toHaveProperty('statement');
    expect(sabrinaBalance.balance).toBe(1500);
  });
});
