import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const decodedObject = this.jwtService.verify(token.toString());
      if (
        typeof decodedObject === 'object' &&
        decodedObject.hasOwnProperty('id')
      ) {
        try {
          const { user, ok } = await this.userService.findUser(
            decodedObject['id'],
          );

          if (ok) {
            req['user'] = user;
          }
        } catch (error) {
          console.error(error);
        }
      }
    }

    next();
  }
}

// export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
//   console.log('~~~req~~~', req.headers);
//   next();
// }
