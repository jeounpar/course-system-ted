import { CourseRegistrationDomain } from './course-registration.domain';
import { CourseRegistrationEntity } from '../../entity';
import { CannotRegisterCourse } from '../../error';

describe('CourseRegistrationDomain', () => {
  let courseRegistration: CourseRegistrationDomain;

  beforeEach(() => {
    const entity = new CourseRegistrationEntity();
    entity.id = 1;
    entity.courseId = 1;
    entity.userId = null;
    entity.createDate = new Date();
    entity.updateDate = new Date();

    courseRegistration = CourseRegistrationDomain.fromEntity(entity);
  });

  it('특강을 신청한다.', () => {
    const userA = 1;

    courseRegistration.register({ userId: userA });

    expect(courseRegistration.userId).toEqual(userA);
  });

  it('이미 신청된 특강은 다시 신청을 할 수 없다.', () => {
    const userA = 1;
    const userB = 2;

    courseRegistration.register({ userId: userA });

    expect(() => {
      courseRegistration.register({ userId: userB });
    }).toThrow(CannotRegisterCourse);
  });
});
