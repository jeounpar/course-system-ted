import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseRegistrationEntity } from '../../entity';
import { EntityManager, Repository } from 'typeorm';
import { CourseRegistrationDomain } from '../domain/course-registration.domain';
import { Nullable } from '../../util';

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

  public async save({ domain }: { domain: CourseRegistrationDomain[] }) {
    await this._repository.save(domain.map((e) => e.toEntity()));
  }

  public findOneBy(entityManager?: EntityManager) {
    const repo = this._getRepository(entityManager);
    return {
      courseIdWithLock: async (
        courseId: number,
      ): Promise<Nullable<CourseRegistrationDomain>> => {
        const entity = await repo.findOne({
          where: { courseId },
          lock: {
            mode: 'pessimistic_write',
          },
          order: { id: 'ASC' },
        });

        return entity ? CourseRegistrationDomain.fromEntity(entity) : null;
      },
      courseId: async (
        courseId: number,
      ): Promise<Nullable<CourseRegistrationDomain>> => {
        const entity = await repo.findOne({
          where: { courseId },
          order: { id: 'ASC' },
        });

        return entity ? CourseRegistrationDomain.fromEntity(entity) : null;
      },
    };
  }
}
