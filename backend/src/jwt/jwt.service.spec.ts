import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TOKEN = 'TOKEN';
const DECODED_OBJECT = { id: 1 };

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => TOKEN),
    verify: jest.fn(() => DECODED_OBJECT),
  };
});

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

  describe('sign()', () => {
    it('token 생성 성공', () => {
      const PAYLOAD = { id: 1 };
      const token = jwtService.sign(PAYLOAD);

      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(
        PAYLOAD,
        TOKEN_SECRET,
        expect.any(Object),
      );

      expect(typeof token).toBe('string');
      expect(token).toBe(TOKEN);
    });
  });

  describe('verify()', () => {
    it('성공', () => {
      const decodedObject = jwtService.verify(TOKEN);

      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TOKEN_SECRET);

      expect(decodedObject).toMatchObject(DECODED_OBJECT);
    });

    it('예외 상황 시 실패', () => {});
  });
});
