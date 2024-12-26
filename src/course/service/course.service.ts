import { Inject, Injectable } from '@nestjs/common';
import { CourseRegistrationRepository, CourseRepository } from '../repository';
import { EntityManager } from 'typeorm';
import { NotFoundError } from '../../error';

@Injectable()
export class CourseService {
  constructor(
    @Inject(CourseRegistrationRepository)
    private readonly _courseRegistrationRepository: CourseRegistrationRepository,
    @Inject(CourseRepository)
    private readonly _courseRepository: CourseRepository,
  ) {}

  public async register({
    userId,
    courseId,
    entityManager,
  }: {
    userId: number;
    courseId: number;
    entityManager?: EntityManager;
  }) {
    const courseRegistration = await this._courseRegistrationRepository
      .findOne(entityManager)
      .emptyWithLock({ courseId });
    if (!courseRegistration)
      throw new NotFoundError(`courseId=${courseId} no available slots`);

    courseRegistration.register({ userId });

    const saved = await this._courseRegistrationRepository.save({
      domain: courseRegistration,
      entityManager,
    });

    return saved;
  }
}
