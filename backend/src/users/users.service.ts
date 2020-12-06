import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import {
  CreateAccountInputDTO,
  CreateAccountOutputDTO,
} from './dto/create-account.dto';
import { LoginInputDTO, LoginOutputDTO } from './dto/login.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from 'src/jwt/jwt.service';
import {
  UpdateProfileInputDTO,
  UpdateProfileOutputDTO,
} from './dto/update-profile.dto';
import { Verification } from './entities/verification.entity';
import {
  VerifyEmailInputDTO,
  VerifyEmailOutputDTO,
} from './dto/verify-email.dto';
import { UserProfileOutputDTO } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepos: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepos: Repository<Verification>,

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
      const user = await this.userRepos.save(
        this.userRepos.create({ email, password, role }),
      );

      await this.verificationRepos.save(
        this.verificationRepos.create({ user }),
      );

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: '계정을 만들지 못했습니다.' };
    }
  }

  async login({ email, password }: LoginInputDTO): Promise<LoginOutputDTO> {
    try {
      // 이메일 확인
      const user = await this.userRepos.findOne(
        { email },
        { select: ['id', 'password'] },
      );
      console.log('user', user);

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
      console.log('token', token);

      return { ok: true, token };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }

  async findUser(id: number): Promise<UserProfileOutputDTO> {
    try {
      const user = await this.userRepos.findOne({ id });
      if (user) {
        return { ok: true, user };
      }
      return { ok: false, error: '해당 유저가 없습니다.' };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }

  async updateProfile(
    userID: number,
    { email, password }: UpdateProfileInputDTO,
  ): Promise<UpdateProfileOutputDTO> {
    try {
      const user = await this.userRepos.findOne(userID);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verificationRepos.save(this.verificationRepos.create(user));
      }
      if (password) {
        user.password = password;
      }

      await this.userRepos.save(user);

      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutputDTO> {
    try {
      const verification = await this.verificationRepos.findOne(
        { code },
        { relations: ['user'] },
      );

      if (verification) {
        verification.user.verified = true;
        await this.userRepos.save(verification.user);
        await this.verificationRepos.delete(verification.id);
        return { ok: true };
      }

      return { ok: false, error: '이메일 체크 실패' };
    } catch (error) {
      console.error(error);
      return { ok: false, error };
    }
  }
}
