import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

// 중복 적용을 위해 함수값을 반환
const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const signedToken = 'Signed Token';
const mockJwtService = () => ({
  sign: jest.fn(() => signedToken),
  verify: jest.fn(),
});

const mockEmailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('User Service Test', () => {
  let userService: UsersService;
  let userRepos: MockRepository<User>; // let userRepos; 이렇게만 써도 오류는 나지 않음
  let verificationRepos: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository() },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        { provide: JwtService, useValue: mockJwtService() },
        { provide: MailService, useValue: mockEmailService() },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepos = module.get(getRepositoryToken(User));
    verificationRepos = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createAccount()', () => {
    const createAccountArgs = {
      email: 'test@naver.com',
      password: '12345',
      role: 0,
    };

    it('해당 이메일이 이미 등록되어 있는 경우 실패', async () => {
      userRepos.findOne.mockResolvedValue({
        id: 1,
        email: 'test@naver.com',
      });

      const result = await userService.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: '해당 이메일이 존재합니다.',
      });
    });

    it('새 계정 생성 성공', async () => {
      userRepos.findOne.mockResolvedValue(undefined);
      userRepos.create.mockReturnValue(createAccountArgs);
      userRepos.save.mockResolvedValue(createAccountArgs);
      verificationRepos.create.mockReturnValue({ user: createAccountArgs });
      const resultCode = 'code';
      verificationRepos.save.mockResolvedValue({ code: resultCode });

      const result = await userService.createAccount(createAccountArgs);

      expect(userRepos.create).toHaveBeenCalledTimes(1);
      expect(userRepos.create).toHaveBeenCalledWith(createAccountArgs);

      expect(userRepos.save).toHaveBeenCalledTimes(1);
      expect(userRepos.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepos.create).toHaveBeenCalledTimes(1);
      expect(verificationRepos.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        createAccountArgs.email,
        resultCode,
      );

      expect(result).toEqual({ ok: true });
    });

    it('예외 발생시 실패', async () => {
      userRepos.findOne.mockRejectedValue(new Error('error'));

      const result = await userService.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: '계정을 만들지 못했습니다.' });
    });
  });

  describe('login()', () => {
    const loginArgs = { email: 'test@naver.com', password: '12345' };
    it('계정이 없을 경우 실패', async () => {
      userRepos.findOne.mockResolvedValue(undefined);

      const result = await userService.login(loginArgs);

      expect(userRepos.findOne).toHaveBeenCalledTimes(1);
      expect(userRepos.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );

      expect(result).toEqual({
        ok: false,
        error: '해당 유저는 존재하지 않습니다.',
      });
    });

    it('패스워드 불일치시 실패', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      userRepos.findOne.mockResolvedValue(mockedUser);

      const result = await userService.login(loginArgs);
      expect(result).toEqual({ ok: false, error: '잘못된 패스워드 입니다.' });
    });

    it('예외 발생시 실패', async () => {
      userRepos.findOne.mockRejectedValue(new Error('error'));

      const result = await userService.login(loginArgs);
      expect(result).toEqual({ ok: false, error: '로그인에 실패했습니다.' });
    });

    it('토큰 생성 & 로그인 성공', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepos.findOne.mockResolvedValue(mockedUser);

      const result = await userService.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: expect.any(Number) });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockedUser.id });

      expect(result).toEqual({ ok: true, token: signedToken });
    });
  });

  describe('findUser()', () => {
    it('유저 검색 성공', async () => {
      const mockedUser = { id: 1 };
      userRepos.findOneOrFail.mockResolvedValue(mockedUser);

      const result = await userService.findUser(1);

      expect(userRepos.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(userRepos.findOneOrFail).toHaveBeenCalledWith({
        id: expect.any(Number),
      });

      expect(result).toEqual({ ok: true, user: mockedUser });
    });

    it('해당 유저가 없을 경우 실패', async () => {
      userRepos.findOneOrFail.mockRejectedValue(new Error('error'));
      const result = await userService.findUser(1);

      expect(result).toEqual({ ok: false, error: '해당 유저가 없습니다.' });
    });
  });

  describe('updateProfile()', () => {
    const oldUser = {
      email: 'oldUser@naver.com',
      password: '12345',
      verified: true,
    };

    const updateProfileArgs = {
      userId: 1,
      input: { email: 'test@naver.com', password: 'qwert' },
    };

    it('이메일 & 패스워드 업데이트 성공', async () => {
      const newVerification = { code: 'code' };
      const newUser = {
        verified: false,
        email: updateProfileArgs.input.email,
        password: updateProfileArgs.input.password,
      };

      userRepos.findOne.mockResolvedValue(oldUser);
      verificationRepos.create.mockReturnValue(newVerification);
      verificationRepos.save.mockResolvedValue(newVerification);

      const result = await userService.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      expect(userRepos.findOne).toHaveBeenCalledTimes(1);
      expect(userRepos.findOne).toHaveBeenCalledWith(updateProfileArgs.userId);

      expect(verificationRepos.create).toHaveBeenCalledTimes(1);
      expect(verificationRepos.create).toHaveBeenCalledWith({ user: newUser });

      expect(verificationRepos.save).toHaveBeenCalledTimes(1);
      expect(verificationRepos.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        newVerification.code,
      );

      expect(userRepos.save).toHaveBeenCalledTimes(1);
      expect(userRepos.save).toHaveBeenCalledWith(newUser);

      expect(result).toEqual({ ok: true });
    });

    it('예외상황 발생시 실패', async () => {
      userRepos.findOne.mockRejectedValue(new Error('error'));

      const result = await userService.updateProfile(
        updateProfileArgs.userId,
        updateProfileArgs.input,
      );

      expect(result).toEqual({
        ok: false,
        error: '프로필 업데이트에 실패했습니다.',
      });
    });
  });

  describe('verifyEmail()', () => {
    const CODE = 'code';

    it('이메일 확인 성공', async () => {
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };

      verificationRepos.findOne.mockResolvedValue(mockedVerification);

      const result = await userService.verifyEmail(CODE);

      expect(verificationRepos.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepos.findOne).toHaveBeenCalledWith(
        { code: CODE },
        expect.any(Object),
      );

      expect(userRepos.save).toHaveBeenCalledTimes(1);
      expect(userRepos.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationRepos.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepos.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });

    it('verification이 없을 시 이메일 확인 실패', async () => {
      verificationRepos.findOne.mockResolvedValue(undefined);

      const result = await userService.verifyEmail(CODE);
      expect(result).toEqual({ ok: false, error: '이메일 인증 실패' });
    });

    it('예외상황 발생시 실패', async () => {
      verificationRepos.findOne.mockRejectedValue(new Error('error'));
      const result = await userService.verifyEmail(CODE);
      expect(result).toEqual({ ok: false, error: 'error' });
    });
  });
});
