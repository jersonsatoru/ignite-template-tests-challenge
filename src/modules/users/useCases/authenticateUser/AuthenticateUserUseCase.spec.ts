import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate user', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should not be able to authenticate a nonexistent user', async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: 'jersonsatoru@yahoo.com.br',
        password: '234234',
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it('Should not be able to authenticate a wrong email or password', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password: '234234',
    });

    await expect(
      authenticateUserUseCase.execute({
        email: 'jersonsatoru@yahoo.com.br2',
        password: jerson.password,
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());

    await expect(
      authenticateUserUseCase.execute({
        email: jerson.email,
        password: `${jerson.password} 1`,
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it('Should be able to authenticate an user', async () => {
    const password = '234234';
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.br',
      name: 'Jerson',
      password,
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: jerson.email,
      password,
    });

    expect(authenticatedUser).toHaveProperty('token');
    expect(authenticatedUser).toHaveProperty('user');
  });
});
