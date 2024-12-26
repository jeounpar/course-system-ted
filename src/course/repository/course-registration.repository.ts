import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRegistrationEntity } from '../../entity';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { CourseRegistrationDomain } from '../domain';
import { Nullable } from '../../util';
import { isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class CourseRegistrationRepository {
  constructor(
    @InjectRepository(CourseRegistrationEntity)
    private _repository: Repository<CourseRegistrationEntity>,
  ) {}

  private _getRepository(entityManager?: EntityManager) {
    return entityManager
      ? entityManager.getRepository(CourseRegistrationEntity)
      : this._repository;
  }

  public async save({
    domain,
    entityManager,
  }: {
    domain: CourseRegistrationDomain;
    entityManager?: EntityManager;
  }) {
    const repo = this._getRepository(entityManager);

    const saved = await repo.save(domain.toEntity());

    return CourseRegistrationDomain.fromEntity(saved);
  }

  public async bulkSave({
    domain,
    entityManager,
  }: {
    domain: CourseRegistrationDomain[];
    entityManager?: EntityManager;
  }) {
    const repo = this._getRepository(entityManager);

    const saved = await repo.save(domain.map((e) => e.toEntity()));

    return saved.map(CourseRegistrationDomain.fromEntity);
  }

  public findOne(entityManager?: EntityManager) {
    const repo = this._getRepository(entityManager);
    return {
      emptyWithLock: async ({
        courseId,
      }: {
        courseId: number;
      }): Promise<Nullable<CourseRegistrationDomain>> => {
        if (isNil(entityManager))
          throw new Error('entityManager must be needed');

        const entity = await repo.findOne({
          where: { courseId, userId: IsNull() },
          lock: {
            mode: 'pessimistic_write',
          },
          order: { id: 'ASC' },
        });

        return entity ? CourseRegistrationDomain.fromEntity(entity) : null;
      },
      empty: async ({
        courseId,
      }: {
        courseId: number;
      }): Promise<Nullable<CourseRegistrationDomain>> => {
        const entity = await repo.findOne({
          where: { courseId, userId: IsNull() },
          order: { id: 'ASC' },
        });

        return entity ? CourseRegistrationDomain.fromEntity(entity) : null;
      },
    };
  }
}
