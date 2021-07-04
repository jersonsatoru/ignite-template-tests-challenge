import { v4 } from 'uuid';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { IUsersRepository } from '../../repositories/IUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileError } from './ShowUserProfileError';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: IUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Show profile', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it('Should not be able to show a profile from a nonexistent user', async () => {
    await expect(showUserProfileUseCase.execute(v4())).rejects.toEqual(
      new ShowUserProfileError()
    );
  });

  it('Should be able to show a profile from an user', async () => {
    const jerson = await createUserUseCase.execute({
      email: 'jersonsatoru@yahoo.com.ve',
      name: 'Jerson',
      password: '234234',
    });

    const userProfile = await showUserProfileUseCase.execute(
      jerson.id as string
    );

    expect(userProfile).toMatchObject(jerson);
  });
});
