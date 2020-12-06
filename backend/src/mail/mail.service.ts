import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVariables, MailModuleOptions } from './mail.interfaces';
import FormData from 'form-data';
import got from 'got';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    emailVariables: EmailVariables[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Jin Company <mailgun@${this.options.domain}>`);
    form.append('to', `sosilion@naver.com`);
    form.append('subject', subject);
    form.append('template', template);
    emailVariables.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('이메일 인증', 'email-verification', [
      { key: 'code', value: code },
      { key: 'userName', value: email },
    ]);
  }
}
