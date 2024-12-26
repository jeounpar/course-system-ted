import { Nullable } from '../../util';
import { CourseRegistrationEntity } from '../../entity';
import { CourseDomain } from './course.domain';
import { UserDomain } from '../../user/domain';
import { CannotRegisterCourse } from '../../error';

export class CourseRegistrationDomain {
  id: number;
  userId: Nullable<number>;
  courseId: number;
  createDate: Date;
  updateDate: Nullable<Date>;

  user: Nullable<UserDomain>;
  course: Nullable<CourseDomain>;

  public static fromEntity(
    entity: CourseRegistrationEntity,
  ): CourseRegistrationDomain {
    const domain = new CourseRegistrationDomain();

    domain.id = entity.id;
    domain.userId = entity.userId;
    domain.courseId = entity.courseId;
    domain.createDate = entity.createDate;
    domain.updateDate = entity.updateDate;

    domain.user = entity.user ? UserDomain.fromEntity(entity.user) : null;
    domain.course = entity.course
      ? CourseDomain.fromEntity(entity.course)
      : null;

    return domain;
  }

  public toEntity() {
    const entity = new CourseRegistrationEntity();

    entity.id = this.id;
    entity.userId = this.userId;
    entity.courseId = this.courseId;
    entity.createDate = this.createDate;
    entity.updateDate = this.updateDate;

    return entity;
  }

  public register({ userId }: { userId: number }) {
    if (this.isAlreadyRegistered())
      throw new CannotRegisterCourse('is already registered');

    this.userId = userId;
  }

  public isNotRegistered() {
    return this.userId === null;
  }

  public isAlreadyRegistered() {
    return !this.isNotRegistered();
  }
}
