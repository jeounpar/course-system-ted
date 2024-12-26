import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourseEntity } from '../../entity';
import { EntityManager, Repository } from 'typeorm';
import { CourseDomain } from '../domain';

@Injectable()
export class CourseRepository {
  constructor(
    @InjectRepository(CourseEntity)
    private _repository: Repository<CourseEntity>,
  ) {}

  private _getRepository(entityManager?: EntityManager) {
    return entityManager
      ? entityManager.getRepository(CourseEntity)
      : this._repository;
  }

  public findOne(entityManager?: EntityManager) {
    const repo = this._getRepository(entityManager);

    return {
      id: async ({ id }: { id: number }) => {
        const entity = await repo.findOne({ where: { id } });

        return entity ? CourseDomain.fromEntity(entity) : null;
      },
    };
  }

  public async save({
    domain,
    entityManager,
  }: {
    domain: CourseDomain;
    entityManager?: EntityManager;
  }) {
    const repo = this._getRepository(entityManager);

    const saved = await repo.save(domain.toEntity());

    return CourseDomain.fromEntity(saved);
  }
}
