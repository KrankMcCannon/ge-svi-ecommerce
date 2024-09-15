import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { User } from '../../users/entities/user.entity';
import { CustomException } from '../custom-exception';
import { EnvironmentVariables } from '../environment-variables';
import { Errors } from '../errors';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvironmentVariables.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw CustomException.fromErrorEnum(Errors.E_0025_USER_NOT_FOUND, {
        data: { email: payload.email },
      });
    }
    return user;
  }
}
