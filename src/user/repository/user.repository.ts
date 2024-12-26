import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entity';
import { EntityManager, Repository } from 'typeorm';
import { UserDomain } from '../domain';
import { Nullable } from '../../util';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private _repository: Repository<UserEntity>,
  ) {}

  private _getRepository(entityManager?: EntityManager) {
    return entityManager
      ? entityManager.getRepository(UserEntity)
      : this._repository;
  }

  public findOneBy(entityManager?: EntityManager) {
    const repo = this._getRepository(entityManager);

    return {
      userId: async (userId: number): Promise<Nullable<UserDomain>> => {
        const user = await repo.findOne({ where: { id: userId } });

        return user ? UserDomain.fromEntity(user) : null;
      },
    };
  }
}
