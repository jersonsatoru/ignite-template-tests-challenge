import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { CreateUserError } from './CreateUserError';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let usersRepository: IUsersRepository;

describe('Create user', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should be able to create an user', async () => {
    const email = 'jersonsatoru@yahoo.com.br';
    const password = '234234';
    const name = 'Jerson';
    const jerson = await createUserUseCase.execute({
      email,
      name,
      password,
    });

    expect(jerson.email).toBe(email);
  });

  it('Should not be able to create a user with an already email used', async () => {
    const email = 'jersonsatoru@yahoo.com.br';
    const password = '234234';
    const name = 'Jerson';

    await createUserUseCase.execute({
      email,
      name,
      password,
    });

    await expect(
      createUserUseCase.execute({
        email,
        name,
        password,
      })
    ).rejects.toEqual(new CreateUserError());
  });
});
