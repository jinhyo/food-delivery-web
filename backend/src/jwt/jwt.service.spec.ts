import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  const TOKEN_SECRET = 'test';

  let jwtService: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: CONFIG_OPTIONS, useValue: { privateKey: TOKEN_SECRET } },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
  });

  it('jwtService 생성 성공', () => {
    expect(jwtService).toBeDefined();
  });
  describe('sign()', () => {});

  describe('verify()', () => {});
});
