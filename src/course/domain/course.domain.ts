import { CourseEntity } from '../../entity';
import { Nullable } from '../../util';
import { UserDomain } from '../../user/domain';
import { CourseRegistrationDomain } from './course-registration.domain';

export class CourseDomain {
  id: number;
  userId: number;
  title: string;
  description: Nullable<string>;
  courseTime: string;
  createDate: Date;
  updateDate: Nullable<Date>;

  user: Nullable<UserDomain>;
  courseRegistrations: CourseRegistrationDomain[];

  private constructor() {}

  public static fromEntity(entity: CourseEntity): CourseDomain {
    const domain = new CourseDomain();

    domain.id = entity.id;
    domain.userId = entity.userId;
    domain.updateDate = entity.updateDate;
    domain.title = entity.title;
    domain.description = entity.description;
    domain.courseTime = entity.courseTime;
    domain.createDate = entity.createDate;
    domain.updateDate = entity.updateDate;

    domain.user = entity.user ? UserDomain.fromEntity(entity.user) : null;
    domain.courseRegistrations = entity.courseRegistrations
      ? entity.courseRegistrations.map(CourseRegistrationDomain.fromEntity)
      : [];

    return domain;
  }

  public toEntity() {
    const entity = new CourseEntity();

    entity.id = this.id;
    entity.userId = this.userId;
    entity.updateDate = this.updateDate;
    entity.title = this.title;
    entity.description = this.description;
    entity.courseTime = this.courseTime;
    entity.createDate = this.createDate;
    entity.updateDate = this.updateDate;

    return entity;
  }

  public isAvailable() {
    const totalCount = this.courseRegistrations.length;
    const currentCount = this.courseRegistrations.filter((e) =>
      e.isAlreadyRegistered(),
    ).length;

    return currentCount !== totalCount;
  }

  public toResponse() {
    const registered = this.courseRegistrations.filter((e) =>
      e.isAlreadyRegistered(),
    );

    return {
      courseId: this.id,
      title: this.title,
      description: this.description,
      totalCount: this.courseRegistrations.length,
      currentCount: registered.length,
      remainCount: this.courseRegistrations.length - registered.length,
      createDate: this.createDate,
    };
  }

  public toHistory() {
    return {
      courseId: this.id,
      title: this.title,
      description: this.description,
      instructorName: this.user.name,
      createDate: this.createDate,
    };
  }
}
