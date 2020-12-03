import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import {
  CreateAccountInputDTO,
  CreateAccountOutputDTO,
} from './dto/create-account.dto';
import { LoginInputDTO, LoginOutputDTO } from './dto/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepos: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInputDTO): Promise<CreateAccountOutputDTO> {
    try {
      // 신규 유저인지 확인
      const presence = await this.userRepos.findOne({ email });
      if (presence) {
        return { ok: false, error: '해당 이메일이 존재합니다.' };
      }

      // 계정 생성 (hash는 entity에서)
      await this.userRepos.save(
        this.userRepos.create({ email, password, role }),
      );
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: '계정을 만들지 못 했습니다.' };
    }
  }

  async login({ email, password }: LoginInputDTO): Promise<LoginOutputDTO> {
    try {
      // 이메일 확인
      const user = await this.userRepos.findOne({ email });
      if (!user) {
        return { ok: false, error: '해당 유저는 존재하지 않습니다.' };
      }

      // 비번 확인
      const exactPassword = await user.checkPassword(password);
      if (!exactPassword) {
        return { ok: false, error: '잘못된 패스워드 입니다.' };
      }

      // 토큰 생성
      const token = this.jwtService.sign({ id: user.id });

      return { ok: true, token };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }

  async findUser(id: number): Promise<User> {
    try {
      const user = await this.userRepos.findOne({ id });

      return user;
    } catch (error) {
      console.error(error);
    }
  }
}
