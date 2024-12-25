import { Nullable } from '../../util';
import { UserEntity, UserType } from '../../entity';
import { CourseDomain } from '../../course/domain/course.domain';
import { CourseRegistrationDomain } from '../../course/domain/course-registration.domain';

export class UserDomain {
  id: number;
  name: string;
  type: UserType;
  createDate: Date;
  updateDate: Nullable<Date>;

  courses: CourseDomain[];
  registrations: CourseRegistrationDomain[];

  private constructor() {}

  public static fromEntity(entity: UserEntity): UserDomain {
    const domain = new UserDomain();

    domain.id = entity.id;
    domain.name = entity.name;
    domain.type = entity.type;
    domain.createDate = entity.createDate;
    domain.updateDate = entity.updateDate;

    domain.courses = entity.courses
      ? entity.courses.map(CourseDomain.fromEntity)
      : [];
    domain.registrations = entity.registrations
      ? entity.registrations.map(CourseRegistrationDomain.fromEntity)
      : [];

    return domain;
  }
}
