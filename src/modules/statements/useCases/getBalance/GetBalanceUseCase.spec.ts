import { v4 } from "uuid"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let getBalanceUseCase: GetBalanceUseCase
let usersRepository: IUsersRepository
let statementsRepository: IStatementsRepository
let createStatementUseCase: CreateStatementUseCase
let createUserUseCase: CreateUserUseCase

describe('Get balance', () => {
  beforeEach(async() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository ,usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('Should not be able to get a balance from a nonexistent account', async() => {
    await expect(
      getBalanceUseCase.execute({ user_id: v4() })
    ).rejects.toEqual(new GetBalanceError())
  })

  it('Should be able to get the correct balance from user', async() => {
    const jerson = await createUserUseCase.execute({
      email: "jersonsatoru@yahoo.com.br",
      name: 'Jerson',
      password: '234234'
    })

    await createStatementUseCase.execute({
      amount: 100,
      description: "Batata frita",
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string
    })

    await createStatementUseCase.execute({
      amount: 70,
      description: "Batata frita",
      type: OperationType.DEPOSIT,
      user_id: jerson.id as string
    })

    await createStatementUseCase.execute({
      amount: 25,
      description: "Batata frita",
      type: OperationType.WITHDRAW,
      user_id: jerson.id as string
    })

    const { balance } = await getBalanceUseCase.execute({ user_id: jerson.id as string })
    expect(balance).toBe(145)
  })
})
