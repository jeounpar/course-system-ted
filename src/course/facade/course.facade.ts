import { Inject, Injectable } from '@nestjs/common';
import { CourseService } from '../service';
import { UserService } from '../../user/service';
import { getDataSource } from '../../config';

@Injectable()
export class CourseFacade {
  constructor(
    @Inject(CourseService) private readonly _courseService: CourseService,
    @Inject(UserService) private readonly _userService: UserService,
  ) {}

  public async registerCourse({
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

  public async findAvailableCourse({ courseTime }: { courseTime: string }) {
    const course = await this._courseService.findAvailable({ courseTime });

    return course.map((e) => e.toResponse());
  }

  public async findRegistrationHistory({ userId }: { userId: number }) {
    const history = await this._courseService.findHistory({ userId });

    return history.map((e) => e.toHistory());
  }
}
