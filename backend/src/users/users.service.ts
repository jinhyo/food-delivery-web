import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInputDTO,
  CreateAccountOutputDTO,
} from './dto/create-account.dto';
import { LoginInputDTO, LoginOutputDTO } from './dto/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepos: Repository<User>,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInputDTO): Promise<CreateAccountOutputDTO> {
    // 신규 유저인지 확인
    try {
      const presence = await this.userRepos.findOne({ email });
      if (presence) {
        return { ok: false, error: '해당 이메일이 존재합니다.' };
      }
      await this.userRepos.save(
        this.userRepos.create({ email, password, role }),
      );
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: '계정을 만들지 못 했습니다.' };
    }
  }

  async login(loginData: LoginInputDTO): Promise<LoginOutputDTO> {
    return;
  }
}
