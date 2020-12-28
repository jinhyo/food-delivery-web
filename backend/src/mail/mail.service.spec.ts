import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import FormData from 'form-data';
import got from 'got';

const API_KEY = 'api-key';
const FROM_EMAIL = 'test@naver.com';
const DOMAIN = 'test.mailgun.org';

jest.mock('got');
jest.mock('form-data');

describe('MailService', () => {
  let mailService: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: API_KEY,
            fromEmail: FROM_EMAIL,
            domain: DOMAIN,
          },
        },
      ],
    }).compile();

    mailService = module.get<MailService>(MailService);
  });

  it('mailService 생성 성공', () => {
    expect(mailService).toBeDefined();
  });

  describe('sendVerificationEmail()', () => {
    it('성공', () => {
      const args = {
        email: 'test@naver.com',
        code: 'code',
      };

      const sendEmailSpy = jest.spyOn(
        MailService.prototype as any,
        'sendEmail',
      );
      // private 함수를 테스트 하기 위한 방법 (prototype 사용)

      mailService.sendVerificationEmail(args.email, args.code);

      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        '이메일 인증',
        'email-verification',
        [
          { key: 'userName', value: args.email },
          { key: 'code', value: args.code },
        ],
      );

      sendEmailSpy.mockClear();
    });
  });

  describe('sendEmail()', () => {
    it('성공', async () => {
      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const postSpy = jest.spyOn(got, 'post');
      postSpy.mockClear();

      const result = await mailService.sendEmail('', '', []);
      // FormData 는 new FormData를 해야 append가 나오기 때문에 prototype 사용
      expect(formSpy).toHaveBeenCalled();
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${DOMAIN}/messages`,
        expect.any(Object),
      );

      expect(result).toEqual(true);
    });

    it('예외 발생시 실패', async () => {
      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await mailService.sendEmail('', '', []);
      expect(result).toEqual(false);
    });
  });
});
