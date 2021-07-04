import { v4 } from "uuid";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let createStatementUseCase: CreateStatementUseCase;
let usersRepository: IUsersRepository;
let statementsRepository: IStatementsRepository
let createUserUseStatement: CreateUserUseCase
let getBalanceUseCase: GetBalanceUseCase

describe('Create Statement', () => {
  beforeEach(async() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    createUserUseStatement = new CreateUserUseCase(usersRepository)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it('Should not be able to create a statement', async() => {
    await expect(
      createStatementUseCase.execute({
        amount: 1,
        description: 'Batata',
        type: OperationType.DEPOSIT,
        user_id: v4(),
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound())
  })

  it('Should not be able to withdraw a value greater than your balance', async() => {
    const jerson = await createUserUseStatement.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson Uyekita',
      password: '234234',
    })

    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: 'Batata Frita do TacoBell',
        type: OperationType.WITHDRAW,
        user_id: jerson.id as string,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds())
  })

  it('Should be able to deposit to an account', async() => {
    const jerson = await createUserUseStatement.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson Uyekita',
      password: '234234',
    })

    const amount = 200

    await createStatementUseCase.execute({
      amount,
      description: 'Batata Frita do TacoBell',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    })

    const { balance } = await getBalanceUseCase.execute({ user_id: jerson.id as string })
    expect(balance).toBe(amount)
  })

  it('Should be able to withdraw from an account', async() => {
    const jerson = await createUserUseStatement.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson Uyekita',
      password: '234234',
    })

    const depositAmount = 200
    const withdrawAmount = 120

    await createStatementUseCase.execute({
      amount: depositAmount,
      description: 'Batata Frita do TacoBell',
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string,
    })


    await createStatementUseCase.execute({
      amount: withdrawAmount,
      description: 'Batata Frita do TacoBell',
      type: OperationType.WITHDRAW,
      user_id: jerson.id as string,
    })

    const { balance } = await getBalanceUseCase.execute({ user_id: jerson.id as string })
    expect(balance).toBe(depositAmount - withdrawAmount)
  })
})
