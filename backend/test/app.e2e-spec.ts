import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { getConnection, Repository } from 'typeorm';
import request from 'supertest';
import { User } from 'src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Verification } from 'src/users/entities/verification.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

describe('AppController (e2e)', () => {
  const EMAIL: string = 'test@naver.com';
  const PWD = '12345';

  let jwtToken: string;
  let userRepos: Repository<User>;
  let verificationRepos: Repository<Verification>;
  let app: INestApplication;

  function baseTest() {
    return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  }

  function logoutStatusTest(query: string) {
    return baseTest().send({ query });
  }

  function loginStatusTest(query: string) {
    return baseTest().set('x-jwt', jwtToken).send({ query });
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepos = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    verificationRepos = moduleFixture.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );

    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createAccount mutation', () => {
    it('계정 생성 성공', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
          createAccount(
            userInfo: { role: Owner, email: "${EMAIL}", password: "${PWD}" }
          ) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(true);
          expect(res.body.data.createAccount.error).toBe(null);
        });
    });

    it('동일한 이메일이 있을 경우 실패', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation {
          createAccount(
            userInfo: { role: Owner, email: "${EMAIL}", password: "${PWD}" }
          ) {
            ok
            error
          }
        }
        `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createAccount.ok).toBe(false);
          expect(res.body.data.createAccount.error).toEqual(expect.any(String));
        });
    });
  });

  describe('login mutation', () => {
    it('계정 일치 시 로그인 성공', () => {
      return logoutStatusTest(`
        mutation {
          login(loginData: { email:"${EMAIL}", password: "${PWD}" }) {
            ok
            error
            token
          }
        }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;

          expect(login.ok).toBe(true);
          expect(login.error).toBe(null);
          expect(login.token).toEqual(expect.any(String));
          jwtToken = login.token;
        });
    });

    it('이메일 불일치 시 로그인 실패', () => {
      return logoutStatusTest(`
        mutation {
          login(loginData: { email: "wrong@naver.com", password: "${PWD}" }) {
            ok
            error
            token
          }
        }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('해당 유저는 존재하지 않습니다.');
        });
    });

    it('패스워드 불일치 시 로그인 실패', () => {
      return logoutStatusTest(`
        mutation {
          login(loginData: { email: "${EMAIL}", password: "wrong" }) {
            ok
            error
            token
          }
        }`)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { login },
            },
          } = res;
          expect(login.ok).toBe(false);
          expect(login.error).toBe('잘못된 패스워드 입니다.');
        });
    });
  });

  describe('userProfile query', () => {
    let userId: number;

    beforeAll(async () => {
      const [user] = await userRepos.find();
      userId = user.id;
      console.log('user', user);
    });

    it('userId가 일치하는 유저가 있을 경우 성공', () => {
      return loginStatusTest(`
        {
          userProfile(id:${userId}){
            ok
            error
            user {
              id
              email
            }
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
          expect(user.id).toBe(userId);
          expect(user.email).toBe(EMAIL);
        });
    });

    it('userId가 일치하는 유저가 없을 경우 실패', () => {
      return loginStatusTest(`
          query {
            userProfile(id: 999) {
              ok
              error
              user {
                id
                email
              }
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                userProfile: { ok, error, user },
              },
            },
          } = res;

          expect(user).toBe(null);
          expect(ok).toBe(false);
          expect(error).toBe('해당 유저가 없습니다.');
        });
    });
  });

  describe('me query', () => {
    it('로그인한 상태일 경우 성공', () => {
      return loginStatusTest(`
          query {
            me {
              email
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          console.log(res.body);
          const {
            body: {
              data: { me },
            },
          } = res;

          expect(me.email).toBe(EMAIL);
        });
    });

    it('로그아웃 상태일 경우 실패', () => {
      return logoutStatusTest(`
          query {
            me {
              email
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  describe('verifyEmail mutation', () => {
    let emailCode: string;

    beforeAll(async () => {
      const [verification] = await verificationRepos.find();
      emailCode = verification.code;
    });

    it('verification code가 없을 경우 이메일 인증 실패', () => {
      return logoutStatusTest(`
          mutation{
            verifyEmail(code:{code: "wrongCode"}){
              ok
              error
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(false);
          expect(error).toBe('이메일 인증 실패');
        });
    });

    it('이메일 인증 성공', () => {
      return logoutStatusTest(`
          mutation{
            verifyEmail(code:{code: "${emailCode}"}){
              ok
              error
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: {
                verifyEmail: { ok, error },
              },
            },
          } = res;

          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
  });

  describe('updateProfile mutation', () => {
    const newEmail = 'new@naver.com';

    it('로그인 상태일 경우 프로필 업데이트 성공', () => {
      return loginStatusTest(`
          mutation {
          updateProfile(updateData: { email: "${newEmail}" }) {
            error
            ok
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          console.log('123', res.body);
          const {
            body: {
              data: { updateProfile },
            },
          } = res;

          expect(updateProfile.ok).toBe(true);
          expect(updateProfile.error).toBe(null);
        });
    });

    it('이메일 변경 성공', () => {
      return loginStatusTest(`
        query {
          me {
            email
          }
        }
        `)
        .expect(200)
        .expect((res) => {
          const {
            body: {
              data: { me },
            },
          } = res;

          expect(me.email).toBe(newEmail);
        });
    });

    it('로그아웃 상태일 경우 실패', () => {
      return logoutStatusTest(`
          mutation {
            updateProfile(updateData: { email: "${newEmail}" }) {
              error
              ok
            }
          }
          `)
        .expect(200)
        .expect((res) => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });
});
