import { Inject, Injectable } from '@nestjs/common';
import { CourseService } from '../service';
import { UserService } from '../../user/service';
import { UserEntity } from '../../entity';
import { getDataSource } from '../../config';

@Injectable()
export class CourseFacade {
  constructor(
    @Inject(CourseService) private readonly _courseService: CourseService,
    @Inject(UserEntity) private readonly _userService: UserService,
  ) {}

  public async register({
    userId,
    courseId,
  }: {
    userId: number;
    courseId: number;
  }) {
    const user = await this._userService.fetch({ userId });

    await getDataSource().transaction(async (entityManager) => {
      await this._courseService.register({
        userId: user.id,
        courseId,
        entityManager,
      });
    });
  }
}
