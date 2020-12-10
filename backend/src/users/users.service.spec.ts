import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mockEmailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('User Service Test', () => {
  let userService: UsersService;
  let userRepos: MockRepository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Verification), useValue: mockRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockEmailService },
      ],
    }).compile();
    userService = module.get<UsersService>(UsersService);
    userRepos = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createAccount()', () => {
    it('should fail, if a user exists', async () => {
      userRepos.findOne.mockResolvedValue({
        id: 1,
        email: 'test@naver.com',
      });

      const result = await userService.createAccount({
        email: '',
        password: '',
        role: 0,
      });

      expect(result).toMatchObject({
        ok: false,
        error: '해당 이메일이 존재합니다.',
      });
    });
  });
  it.todo('login()');
  it.todo('findUser()');
  it.todo('updateProfile()');
  it.todo('verifyEmail()');
});
