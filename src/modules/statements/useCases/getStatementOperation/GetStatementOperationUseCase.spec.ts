import { v4 } from 'uuid';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { IStatementsRepository } from '../../repositories/IStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe('Get statement operation', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it('Should not be able get a statement operation from a nonexistent user', async () => {
    await expect(
      getStatementOperationUseCase.execute({
        statement_id: v4(),
        user_id: v4(),
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it('Should not be able get a statement operation from a nonexistent statement', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password: '234234',
    });

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: v4(),
        user_id: jerson.id as string,
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it('Should be able get a statement operation', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password: '234234',
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: 'Batata frita',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    });

    const statementRetrivied = await getStatementOperationUseCase.execute({
      statement_id: statement.id as string,
      user_id: jerson.id as string,
    });

    expect(statementRetrivied).toMatchObject(statement);
  });
});
