import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { EntityManager } from 'typeorm';
import { NotFoundError } from '../../error';

@Injectable()
export class UserService {
  constructor(
    @Inject(UserRepository) private readonly _userRepository: UserRepository,
  ) {}

  public async fetch({
    userId,
    entityManager,
  }: {
    userId: number;
    entityManager?: EntityManager;
  }) {
    const user = await this._userRepository
      .findOneBy(entityManager)
      .userId(userId);

    if (!user) throw new NotFoundError(`userId=${userId} user not found`);

    return user;
  }
}
